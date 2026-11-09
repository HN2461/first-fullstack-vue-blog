import { Feedback } from '../models/Feedback.js'
import { FeedbackEvent } from '../models/FeedbackEvent.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { Notification } from '#modules/notification/models/Notification.js'
import { USER_ROLES } from '#constants/domain'

/** 查询有反馈处理权限的活跃账号；返回 ID，不依赖讨论权限，也不按用户名识别管理员。 */
export async function getFeedbackManagers() {
  const menu = await Menu.findOne({ routePath: '/console/manage/feedback', enabled: true }).select('_id')
  const roles = await Role.find({ status: 'active', $or: [{ isSuperAdmin: true }, ...(menu ? [{ menuIds: menu._id }] : [])] }).select('_id')
  return User.find({
    status: { $ne: 'disabled' },
    $or: [{ role: USER_ROLES.SUPER_ADMIN }, { roles: { $in: roles.map((role) => role._id) } }]
  }).select('_id')
}

/** 将已提交事件投递为定向通知；事件与接收人组合幂等，失败保留待投递标记。 */
export async function deliverFeedbackEvent(event) {
  if (!event.ready || event.notifiedAt) return
  const feedback = await Feedback.findById(event.feedback).select('title number createdBy')
  if (!feedback) return
  const managers = new Set((await getFeedbackManagers()).map((user) => String(user._id)))
  for (const recipient of event.recipients) {
    if (String(recipient) === String(event.actor)) continue
    const isOwner = String(recipient) === String(feedback.createdBy)
    if (!isOwner && !managers.has(String(recipient))) continue
    const link = `${isOwner ? '/console/feedback' : '/console/manage/feedback'}?id=${feedback._id}`
    const action = {
      created: '收到新反馈',
      reply: '反馈有新回复',
      status: '反馈处理进度已更新',
      reopen: '反馈已重新打开',
      withdraw: '反馈已撤回'
    }[event.kind]
    const eventKey = `feedback:${event._id}:${recipient}`
    await Notification.updateOne(
      { eventKey },
      {
        $setOnInsert: {
          eventKey,
          recipient,
          type: 'system',
          title: `${action} · ${feedback.number}`,
          content: `${feedback.title}\n${event.content || '点击查看反馈详情和处理记录。'}`.slice(0, 10000),
          link,
          author: event.actor,
          isActive: true,
          autoPopup: false
        }
      },
      { upsert: true }
    )
  }
  await FeedbackEvent.updateOne({ _id: event._id, ready: true }, { $set: { notifiedAt: new Date() } })
}

/** 重试已落库的待投递事件；每批最多 50 条，单条失败不阻断其他反馈。 */
export async function flushFeedbackNotifications() {
  const events = await FeedbackEvent.find({ ready: true, notifiedAt: null }).sort({ createdAt: 1 }).limit(50)
  for (const event of events) {
    await deliverFeedbackEvent(event).catch((error) => console.error('反馈通知投递失败', error.message))
  }
}

/** 启动离线通知重试；无参数，返回停止函数，服务端每分钟补发失败事件。 */
export function startFeedbackNotificationRetry() {
  let running = false
  const run = async () => {
    if (running) return
    running = true
    try {
      await flushFeedbackNotifications()
    } catch (error) {
      console.error('反馈通知重试失败', error.message)
    } finally {
      running = false
    }
  }
  void run()
  const timer = setInterval(run, 60000)
  timer.unref()
  return () => clearInterval(timer)
}
