import { Setting } from '../models/Setting.js'

const DEFAULT_SETTINGS = {
  siteTitle: '个人全栈博客系统',
  siteDescription: '一个由 Vue、Express 和 MongoDB 驱动的个人技术博客。',
  authorName: 'Haonan',
  commentEnabled: true,
  defaultTheme: 'light',
  systemVersion: 'v1.0.0'
}

export async function getSettings() {
  const settings = await Setting.find()
  return {
    ...DEFAULT_SETTINGS,
    ...Object.fromEntries(settings.map((item) => [item.key, item.value]))
  }
}

export async function updateSettings(input, user) {
  const entries = Object.entries(input)

  for (const [key, value] of entries) {
    await Setting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        group: key.startsWith('site') || key.startsWith('author') ? 'site' : 'system',
        updatedBy: user._id
      },
      {
        upsert: true,
        new: true
      }
    )
  }

  return getSettings()
}
