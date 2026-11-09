import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { Feedback, FEEDBACK_STATUSES, FEEDBACK_TYPES } from '../models/Feedback.js'
import { FeedbackEvent } from '../models/FeedbackEvent.js'
import { Media } from '#modules/media/models/Media.js'
import { getBusinessDate } from '#utils/businessDate.js'
import { discardFeedbackAttachments, storeFeedbackAttachments, resolveFeedbackAttachment } from './feedbackAttachment.service.js'
import { deliverFeedbackEvent, getFeedbackManagers } from './feedbackNotification.service.js'

const locks = new Set()
const error = (statusCode, message, code = 'FEEDBACK_ERROR') => Object.assign(new Error(message), { statusCode, code })
const actorId = (actor) => actor._id || actor.id
const safeUser = (user) =>
  user?._id ? { id: String(user._id), username: user.username || '用户' } : { id: String(user || ''), username: '用户' }
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize, 10) || 20))
  return { page, pageSize, skip: (page - 1) * pageSize }
}

function serializeAttachment(media) {
  return { id: String(media._id), name: media.originalName, size: media.size, url: media.url }
}

function serializeFeedback(item) {
  return {
    id: String(item._id),
    number: item.number,
    type: item.type,
    title: item.title,
    content: item.content,
    sourcePath: item.sourcePath,
    environment: item.environment,
    status: item.status,
    version: item.version,
    createdBy: safeUser(item.createdBy),
    attachments: (item.attachments || []).filter((media) => media?._id && !media.deletedAt).map(serializeAttachment),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastActivityAt: item.lastActivityAt
  }
}

function serializeEvent(item) {
  return {
    id: String(item._id),
    kind: item.kind,
    content: item.content,
    actor: safeUser(item.actor),
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    createdAt: item.createdAt,
    attachments: (item.attachments || []).filter((media) => media?._id && !media.deletedAt).map(serializeAttachment)
  }
}

/** 按访问上下文读取反馈；普通列表只允许本人，非法 ID、越权和不存在统一返回 404。 */
export async function findFeedback(id, actor, management = false) {
  if (!mongoose.isObjectIdOrHexString(id)) throw error(404, '反馈不存在')
  const item = await Feedback.findOne({ _id: id, ...(management ? {} : { createdBy: actorId(actor) }) })
  if (!item) throw error(404, '反馈不存在')
  return item
}

/** 分页查询反馈；参数为筛选、登录用户和管理范围，返回轻量列表，筛选值非法时拒绝。 */
export async function listFeedback(query, actor, management = false) {
  const { page, pageSize, skip } = pagination(query)
  const filter = management ? {} : { createdBy: actorId(actor) }
  if (query.status) {
    if (!FEEDBACK_STATUSES.includes(query.status)) throw error(400, '反馈状态不正确')
    filter.status = query.status
  }
  if (query.type) {
    if (!FEEDBACK_TYPES.includes(query.type)) throw error(400, '反馈类型不正确')
    filter.type = query.type
  }
  if (query.keyword) {
    const pattern = new RegExp(escapeRegex(String(query.keyword).trim().slice(0, 120)), 'i')
    filter.$or = [{ title: pattern }, { number: pattern }]
  }
  if (management && query.createdBy) {
    if (!mongoose.isObjectIdOrHexString(query.createdBy)) throw error(400, '提交者不正确')
    filter.createdBy = query.createdBy
  }
  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .select('-content -environment -attachments -requestId')
      .populate('createdBy', 'username')
      .sort({ lastActivityAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Feedback.countDocuments(filter)
  ])
  return { items: items.map(serializeFeedback), total, page, pageSize }
}

/** 读取反馈正文和最近一页记录；返回附件的受控 URL，不返回磁盘路径或通知收件人。 */
export async function getFeedback(id, actor, management = false) {
  const item = await findFeedback(id, actor, management)
  await item.populate([{ path: 'createdBy', select: 'username' }, { path: 'attachments' }])
  return { ...serializeFeedback(item), events: await listFeedbackEvents(id, {}, actor, management) }
}

/** 分页读取反馈沟通记录；最新一页在前，返回 page/total 便于完整访问长历史。 */
export async function listFeedbackEvents(id, query, actor, management = false) {
  await findFeedback(id, actor, management)
  const { page, pageSize, skip } = pagination(query)
  const filter = { feedback: id, ready: true }
  const [items, total] = await Promise.all([
    FeedbackEvent.find(filter)
      .populate('actor', 'username')
      .populate('attachments')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    FeedbackEvent.countDocuments(filter)
  ])
  return { items: items.map(serializeEvent), total, page, pageSize }
}

async function recipients(feedback, actor, management) {
  const ids = management ? [feedback.createdBy] : (await getFeedbackManagers()).map((user) => user._id)
  return [...new Set(ids.map(String))].filter((id) => id !== String(actorId(actor)))
}

async function notify(event) {
  // 业务提交成功后再发通知；投递失败由持久化事件和后台任务补发。
  await deliverFeedbackEvent(event).catch((cause) => console.error('反馈通知等待补发', cause.message))
}

/** 创建反馈及首批截图；requestId 使重试幂等，失败会回收本次附件和未完成记录。 */
export async function createFeedback(input, files, actor) {
  const lock = `create:${actorId(actor)}:${input.requestId}`
  if (locks.has(lock)) throw error(409, '反馈正在提交，请稍后重试')
  locks.add(lock)
  let stored = []
  let item = null
  let committed = false
  try {
    const existing = await Feedback.findOne({ createdBy: actorId(actor), requestId: input.requestId })
    if (existing) return getFeedback(existing._id, actor)
    const id = new mongoose.Types.ObjectId()
    stored = await storeFeedbackAttachments(files, id, actorId(actor))
    // 只保留控制台路径；查询参数可能包含提取码、关键词或私人资料。
    const rawPath = input.sourcePath.split(/[?#]/)[0]
    const sourcePath = /^\/console(?:\/|$)/.test(rawPath) && !/[\\\u0000-\u001f]/.test(rawPath) ? rawPath.slice(0, 500) : ''
    item = await Feedback.create({
      _id: id,
      ...input,
      sourcePath,
      createdBy: actorId(actor),
      number: `FB-${getBusinessDate().replaceAll('-', '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      attachments: stored.map((media) => media._id)
    })
    const event = await FeedbackEvent.create({
      feedback: id,
      actor: actorId(actor),
      requestId: input.requestId,
      kind: 'created',
      toStatus: 'pending',
      ready: true,
      recipients: await recipients(item, actor, false)
    })
    committed = true
    await notify(event)
    return getFeedback(id, actor)
  } catch (cause) {
    if (!committed) {
      if (item) await Feedback.deleteOne({ _id: item._id }).catch(() => {})
      await discardFeedbackAttachments(stored)
    }
    throw cause
  } finally {
    locks.delete(lock)
  }
}

/** 追加回复或状态事件；校验版本、归属与终态，失败不丢输入，也不产生重复回复。 */
export async function addFeedbackEvent(id, kind, input, files, actor, management = false) {
  const item = await findFeedback(id, actor, management)
  const replay = await FeedbackEvent.findOne({ feedback: id, actor: actorId(actor), requestId: input.requestId, ready: true })
  if (replay) return getFeedback(id, actor, management)
  if (locks.has(String(id))) throw error(409, '该反馈正在更新，请稍后重试')
  locks.add(String(id))
  let stored = []
  let event = null
  let updated = false
  const before = { status: item.status, version: item.version, lastActivityAt: item.lastActivityAt }
  try {
    if (item.version !== input.version) throw error(409, '反馈已更新，请刷新详情后重试', 'FEEDBACK_VERSION_CONFLICT')
    const terminal = ['completed', 'closed'].includes(item.status)
    let status = item.status
    if (kind === 'reply') {
      if (terminal) throw error(409, '请先重新打开反馈，再继续回复')
      if (!input.content && !files.length) throw error(400, '请填写回复或添加图片')
      if (!management && status === 'waiting') status = 'pending'
    } else if (kind === 'status') {
      if (!management) throw error(403, '没有反馈处理权限')
      if (!input.status || input.status === status) throw error(400, '请选择不同的处理状态')
      if (!input.content) throw error(400, '请填写处理说明')
      status = input.status
    } else if (kind === 'reopen') {
      if (!terminal) throw error(409, '只有已完成或已关闭的反馈可以重新打开')
      if (!input.content) throw error(400, '请说明仍然存在的问题')
      status = 'pending'
    } else if (kind === 'withdraw') {
      if (String(item.createdBy) !== String(actorId(actor))) throw error(403, '只能撤回自己的反馈')
      if (terminal) throw error(409, '该反馈已经结束')
      if (!input.content) throw error(400, '请填写撤回原因')
      status = 'closed'
    } else throw error(400, '反馈操作不正确')
    stored = await storeFeedbackAttachments(files, item._id, actorId(actor))
    event = await FeedbackEvent.create({
      feedback: id,
      actor: actorId(actor),
      requestId: input.requestId,
      kind,
      content: input.content,
      attachments: stored.map((media) => media._id),
      fromStatus: item.status,
      toStatus: status,
      recipients: await recipients(item, actor, management)
    })
    const result = await Feedback.updateOne(
      { _id: id, version: input.version },
      {
        $set: { status, lastActivityAt: new Date() },
        $inc: { version: 1 }
      }
    )
    if (!result.modifiedCount) throw error(409, '反馈已更新，请刷新详情后重试', 'FEEDBACK_VERSION_CONFLICT')
    updated = true
    event.ready = true
    await event.save()
  } catch (cause) {
    if (updated) await Feedback.updateOne({ _id: id, version: before.version + 1 }, { $set: before }).catch(() => {})
    if (event) await FeedbackEvent.deleteOne({ _id: event._id }).catch(() => {})
    await discardFeedbackAttachments(stored)
    throw cause
  } finally {
    locks.delete(String(id))
  }
  await notify(event)
  return getFeedback(id, actor, management)
}

/** 获取图片文件；用户需拥有反馈菜单和对应记录，处理人需拥有反馈管理菜单。 */
export async function getFeedbackAttachment(id, actor, management) {
  if (!mongoose.isObjectIdOrHexString(id)) throw error(404, '图片不存在')
  const media = await Media.findOne({ _id: id, feedback: { $ne: null }, accessScope: 'private', deletedAt: null })
  if (!media) throw error(404, '图片不存在')
  const feedback = await findFeedback(media.feedback, actor, management)
  const linked =
    feedback.attachments.some((entry) => String(entry) === String(id)) ||
    (await FeedbackEvent.exists({ feedback: feedback._id, ready: true, attachments: id }))
  if (!linked) throw error(404, '图片不存在')
  return resolveFeedbackAttachment(media)
}
