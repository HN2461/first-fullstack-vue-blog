import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { CustomFestival } from '#modules/festival/models/CustomFestival.js'
import { Setting } from '#modules/settings/models/Setting.js'
import { User } from '#modules/user/models/User.js'

const APPLY = process.argv.includes('--apply')

const SITE_PROFILE = {
  siteTitle: '浩南的全栈博客系统',
  siteDescription: '一个持续建设的个人技术知识库，记录前端、后端、数据库、项目部署与日常实践。',
  authorName: '浩南',
  systemVersion: 'v1.0.0'
}

const FIRST_DEPLOYMENT_FESTIVAL = {
  name: '网站首次成功部署纪念日',
  month: 6,
  day: 17,
  category: 'system-broadcast',
  source: '项目部署记录：2026-06-17 首次公网验证成功',
  greeting: '网站第一次成功运行并通过公网验证，纪念这次重要的起点。',
  effect: 'new-year',
  isMajor: true,
  enabled: true,
  deletedAt: null
}

async function findCurrentState() {
  const keys = Object.keys(SITE_PROFILE)
  const [settings, festival] = await Promise.all([
    Setting.find({ key: { $in: keys } }).select('key value updatedBy').lean(),
    CustomFestival.findOne({
      name: FIRST_DEPLOYMENT_FESTIVAL.name,
      month: FIRST_DEPLOYMENT_FESTIVAL.month,
      day: FIRST_DEPLOYMENT_FESTIVAL.day
    }).lean()
  ])

  return { settings, festival }
}

async function applyChanges(current) {
  const siteTitleSetting = current.settings.find((item) => item.key === 'siteTitle')
  const fallbackUser = await User.findOne({ role: 'super_admin' }).select('_id').lean()
  const updatedBy = siteTitleSetting?.updatedBy || fallbackUser?._id || null

  for (const [key, value] of Object.entries(SITE_PROFILE)) {
    await Setting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        group: key === 'authorName' || key.startsWith('site') ? 'site' : 'system',
        ...(updatedBy ? { updatedBy } : {})
      },
      { upsert: true, new: true }
    )
  }

  await CustomFestival.updateMany(
    { category: 'project' },
    { $set: { category: 'system-broadcast' } }
  )

  await CustomFestival.findOneAndUpdate(
    {
      name: FIRST_DEPLOYMENT_FESTIVAL.name,
      month: FIRST_DEPLOYMENT_FESTIVAL.month,
      day: FIRST_DEPLOYMENT_FESTIVAL.day
    },
    {
      $set: FIRST_DEPLOYMENT_FESTIVAL,
      $setOnInsert: { ...(updatedBy ? { createdBy: updatedBy } : {}) }
    },
    { upsert: true, new: true }
  )
}

async function main() {
  await connectDatabase()
  const current = await findCurrentState()
  const settingsToChange = Object.entries(SITE_PROFILE).filter(([key, value]) => current.settings.find((item) => item.key === key)?.value !== value)
  const festivalNeedsChange = !current.festival || Object.entries(FIRST_DEPLOYMENT_FESTIVAL).some(([key, value]) => current.festival[key] !== value)

  console.log(`运行模式：${APPLY ? 'apply（写入数据库）' : 'dry-run（只预览）'}`)
  console.log(`基础信息待调整：${settingsToChange.length} 项`)
  console.log(`首次部署纪念日：${festivalNeedsChange ? '待创建或更新' : '已是目标状态'}`)

  if (APPLY && (settingsToChange.length || festivalNeedsChange)) {
    await applyChanges(current)
    console.log('站点基础信息和首次部署纪念日已幂等写入。')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
