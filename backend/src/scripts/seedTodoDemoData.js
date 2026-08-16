import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { User } from '#modules/user/models/User.js'
import { TodoItem } from '#modules/todo/models/TodoItem.js'
import { TodoList } from '#modules/todo/models/TodoList.js'

// 演示数据使用独立标记，清理时不会误删用户自己创建的待办清单。
const seedKey = process.env.TODO_DEMO_SEED_KEY || 'todo-demo-2026-08-16'
const applyChanges = process.argv.includes('--apply')
const clearOnly = process.argv.includes('--clear')
const adminEmail = (env.adminEmail || 'admin@example.com').trim().toLowerCase()

const today = '2026-08-16T09:00:00+08:00'
const travelDate = '2026-08-22T09:00:00+08:00'

const demoLists = [
  {
    title: '今天的工作',
    type: 'daily',
    planDate: today,
    isPinned: true,
    items: [
      { title: '回复客户邮件', priority: 'high', note: '优先处理合同确认邮件' },
      { title: '整理文章目录', priority: 'medium' },
      { title: '检查服务器备份', priority: 'high', note: '确认最近一次备份时间和恢复点' },
      { title: '更新项目记录台账', priority: 'low' },
      { title: '完成待发布文章校对', priority: 'medium', completed: true }
    ]
  },
  {
    title: '本周购物',
    type: 'shopping',
    planDate: null,
    items: [
      { title: '牛奶', priority: 'medium', completed: true },
      { title: '鸡蛋', priority: 'medium' },
      { title: '洗衣液', priority: 'low', note: '购买无香型补充装' },
      { title: '垃圾袋', priority: 'low' },
      { title: '充电电池', priority: 'high' }
    ]
  },
  {
    title: '周末出行准备',
    type: 'travel',
    planDate: travelDate,
    items: [
      { title: '身份证', priority: 'high', completed: true },
      { title: '充电器', priority: 'high' },
      { title: '备用数据线', priority: 'medium' },
      { title: '预订酒店', priority: 'high', note: '周五前确认入住信息' },
      { title: '下载离线地图', priority: 'low' }
    ]
  },
  {
    title: '家庭事务',
    type: 'custom',
    planDate: today,
    items: [
      { title: '预约周三家政上门', priority: 'medium', note: '确认到达时间和服务范围' },
      { title: '缴纳本月水电费', priority: 'high' },
      { title: '给父母回电话', priority: 'high', completed: true },
      { title: '更换净水器滤芯', priority: 'low' },
      { title: '整理阳台纸箱', priority: 'low', completed: true }
    ]
  },
  {
    title: '周一项目例会',
    type: 'daily',
    planDate: '2026-08-17T09:00:00+08:00',
    items: [
      { title: '准备本周迭代进度', priority: 'high' },
      { title: '确认待办页面验收项', priority: 'high', note: '布局、权限、数据清理命令' },
      { title: '同步设计评审结论', priority: 'medium' },
      { title: '会后更新项目记录', priority: 'low' }
    ]
  },
  {
    title: '阅读与学习计划',
    type: 'custom',
    planDate: null,
    items: [
      { title: '阅读数据库索引章节', priority: 'medium', completed: true },
      { title: '整理三条可复用结论', priority: 'medium' },
      { title: '完成一个查询优化练习', priority: 'high' },
      { title: '把笔记归档到知识库', priority: 'low' },
      { title: '周末复盘并安排下周内容', priority: 'low' }
    ]
  },
  {
    title: '运动打卡（八月）',
    type: 'custom',
    planDate: null,
    items: [
      { title: '周一：慢跑 30 分钟', priority: 'medium', completed: true },
      { title: '周三：力量训练', priority: 'medium' },
      { title: '周五：拉伸和核心', priority: 'low' },
      { title: '周末：户外骑行', priority: 'medium' }
    ]
  },
  {
    title: '归档：搬家准备',
    type: 'custom',
    planDate: '2026-08-09T09:00:00+08:00',
    status: 'archived',
    items: [
      { title: '预约搬家公司', priority: 'high', completed: true },
      { title: '整理书籍', priority: 'medium', completed: true },
      { title: '准备纸箱', priority: 'low', completed: true }
    ]
  },
  {
    title: '归档：上周工作复盘',
    type: 'daily',
    planDate: '2026-08-14T09:00:00+08:00',
    status: 'archived',
    items: [
      { title: '完成文章导入检查', priority: 'high', completed: true },
      { title: '处理两条评论反馈', priority: 'medium', completed: true },
      { title: '更新部署说明', priority: 'low', completed: true },
      { title: '记录本周风险项', priority: 'medium', completed: true }
    ]
  },
  {
    title: '长清单：新家物品盘点',
    type: 'custom',
    planDate: today,
    items: [
      '客厅落地灯', '窗帘尺寸', '书桌理线器', '路由器', '插线板', '垃圾桶',
      '衣架', '收纳盒', '床品四件套', '浴巾', '洗手液', '拖把', '扫把簸箕',
      '厨房纸', '保鲜膜', '密封罐', '菜刀', '砧板', '锅具', '餐具', '水杯',
      '咖啡滤纸', '常用药品', '创可贴', '螺丝刀套装', '卷尺', '电池', '灯泡',
      '门垫', '绿植花盆', '备用钥匙', '入住清洁'
    ].map((title, index) => ({
      title,
      priority: index === 3 || index === 24 ? 'high' : index % 5 === 0 ? 'low' : 'medium',
      completed: index < 4,
      note: index === 24 ? '确认规格后再下单' : ''
    }))
  }
]

async function findTargetUser() {
  const user = await User.findOne({ email: adminEmail })
  if (!user) throw new Error(`找不到演示数据所属用户：${adminEmail}`)
  return user
}

async function removeSeedData(userId) {
  const lists = await TodoList.find({ createdBy: userId, seedKey }).select('_id')
  const listIds = lists.map((list) => list._id)
  const itemResult = listIds.length
    ? await TodoItem.deleteMany({ createdBy: userId, listId: { $in: listIds } })
    : { deletedCount: 0 }
  const listResult = await TodoList.deleteMany({ createdBy: userId, seedKey })
  return { lists: listResult.deletedCount || 0, items: itemResult.deletedCount || 0 }
}

async function main() {
  await connectDatabase()
  const user = await findTargetUser()
  const existing = await TodoList.countDocuments({ createdBy: user._id, seedKey })

  console.log(`${applyChanges ? 'Apply' : 'Dry-run'}：待办演示数据标记 ${seedKey}`)
  console.log(`所属用户：${user.email}，已有演示清单：${existing} 张`)
  console.log(`计划写入：${demoLists.length} 张清单，${demoLists.reduce((sum, list) => sum + list.items.length, 0)} 条事项`)

  if (clearOnly) {
    if (!applyChanges) {
      console.log('清理预览：不会修改数据库。确认后使用 --clear --apply 才会删除演示数据。')
      return
    }
    const result = await removeSeedData(user._id)
    console.log(`演示数据已清除：${result.lists} 张清单，${result.items} 条事项。`)
    return
  }

  if (!applyChanges) {
    console.log('未修改数据库。确认后使用 --apply 写入演示数据。')
    return
  }

  await removeSeedData(user._id)
  for (const [listIndex, definition] of demoLists.entries()) {
    const list = await TodoList.create({
      title: definition.title,
      type: definition.type,
      planDate: definition.planDate,
      status: definition.status || 'active',
      isPinned: definition.isPinned === true,
      seedKey,
      createdBy: user._id
    })

    await TodoItem.insertMany(definition.items.map((item, itemIndex) => ({
      listId: list._id,
      createdBy: user._id,
      title: typeof item === 'string' ? item : item.title,
      note: typeof item === 'string' ? '' : item.note || '',
      priority: typeof item === 'string' ? 'medium' : item.priority || 'medium',
      completed: typeof item === 'string' ? false : item.completed === true,
      completedAt: typeof item === 'string' || !item.completed ? null : new Date(),
      sortOrder: (itemIndex + 1) * 10
    })))
    console.log(`已写入 ${listIndex + 1}/${demoLists.length}：${definition.title}`)
  }
  console.log('待办演示数据已写入。审核完成后可运行 node src/scripts/seedTodoDemoData.js --clear --apply 清理。')
}

try {
  await main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await disconnectDatabase()
}
