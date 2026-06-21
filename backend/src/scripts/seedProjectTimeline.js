import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { upsertProjectTimelineSeedRecord } from '#modules/projectTimeline/services/projectTimeline.service.js'

const applyChanges = process.argv.includes('--apply')
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))
const legacyNotificationsPath = sourceArg
  ? path.resolve(sourceArg.slice('--source='.length))
  : path.resolve(env.rootDir, '..', '..', '个人技术博客网站', 'public', 'notifications.json')

const allowedLegacySources = new Set(['history', 'daily', 'manual'])
const allowedLegacyLabels = new Set(['历史消息', '今日消息', '手动消息'])
const categoryMap = new Map([
  ['内容上新', '内容上新'],
  ['功能更新', '功能更新'],
  ['问题修复', '问题修复'],
  ['系统公告', '系统公告'],
  ['历史消息', '版本调整'],
  ['今日消息', '版本调整'],
  ['手动消息', '手动记录'],
  ['Git 提交', '版本调整']
])

const currentProjectRecords = [
  ['2026-06-14T00:06:19+08:00', '初步重构全栈博客系统', '以全新的前后端分离系统替代旧静态博客兼容改造思路，启动 Vue 3、Express、MongoDB 架构重构。', '项目搭建', 'current-2026-06-14-initial-rebuild'],
  ['2026-06-14T10:27:23+08:00', '整体链路重构', '整理公开门户、登录控制台、后台管理域的产品骨架，建立文章、媒体、迁移配置等核心链路。', '项目搭建', 'current-2026-06-14-core-flow'],
  ['2026-06-14T13:55:48+08:00', '文档详情与迁移配置成型', '补齐文档详情页与迁移配置能力，为旧内容导入和分类整理提供基础。', '功能更新', 'current-2026-06-14-migration-detail'],
  ['2026-06-15T22:52:45+08:00', '媒体资源能力完善', '完善媒体资源管理、资源选择与文章阅读体验相关能力。', '功能更新', 'current-2026-06-15-media-reader'],
  ['2026-06-16T22:57:30+08:00', '全文搜索能力完善', '围绕公开搜索、控制台搜索、搜索索引与搜索结果展示持续补齐检索体验。', '功能更新', 'current-2026-06-16-search'],
  ['2026-06-17T21:12:30+08:00', '前后端分离架构重构', '明确 frontend 与 backend 独立项目边界，整理代码目录、接口链路和部署文档。', '项目搭建', 'current-2026-06-17-split-architecture'],
  ['2026-06-17T23:57:03+08:00', '完成从 0 到 1 部署验证', '完成首次部署实验，并修复左侧菜单因接口返回数据过大导致加载失败的问题。', '部署发布', 'current-2026-06-17-first-deploy'],
  ['2026-06-18T23:54:56+08:00', '认证、备忘录与后台菜单管理升级', '升级认证流程、备忘录页面、后台菜单管理与权限相关能力。', '功能更新', 'current-2026-06-18-auth-menu'],
  ['2026-06-19T14:28:23+08:00', '角色与菜单权限管理完善', '完善 RBAC 角色、菜单、权限审批和后端控菜单逻辑。', '功能更新', 'current-2026-06-19-rbac'],
  ['2026-06-19T21:06:54+08:00', '项目代码结构重构', '按前后端模块边界继续拆分超大文件，补齐回收站、文章管理排序和分类筛选等管理体验。', '版本调整', 'current-2026-06-19-code-structure'],
  ['2026-06-20T20:52:32+08:00', '后端菜单与文档导入完善', '继续完善后端菜单体系、文章目录模块、文档导入和后台配置能力。', '功能更新', 'current-2026-06-20-menu-import'],
  ['2026-06-21T18:10:00+08:00', '公告通知联动与重新推送修复', '修复公告详情与通知列表弹层联动、重新推送开关语义和通知角标位置。', '问题修复', 'current-2026-06-21-notification-fix']
].map(([occurredAt, title, detail, category, legacyId]) => ({
  occurredAt,
  title,
  detail,
  category,
  legacyId,
  source: 'current_project'
}))

export function readLegacyNotifications(filePath = legacyNotificationsPath) {
  if (!fs.existsSync(filePath)) {
    return { records: [], skipped: [{ reason: '旧通知文件不存在', path: filePath }] }
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const notifications = Array.isArray(raw.notifications) ? raw.notifications : []
  const records = []
  const skipped = []

  notifications.forEach((item) => {
    const labels = [item.source, item.tag, item.category].filter(Boolean)
    const shouldImport = allowedLegacySources.has(item.source) ||
      labels.some((label) => allowedLegacyLabels.has(label))

    if (!shouldImport) return

    const occurredAt = item.date || item.historyDate
    const detail = item.content || item.summary
    if (!item.title || !detail || !occurredAt) {
      skipped.push({ id: item.id, reason: '缺少标题、详情或时间' })
      return
    }

    const source = item.source === 'manual'
      ? 'legacy_manual'
      : item.source === 'daily'
        ? 'legacy_daily'
        : 'legacy_history'
    const category = categoryMap.get(item.itemCategory || item.category || item.tag) || '版本调整'

    records.push({
      title: item.title,
      detail,
      occurredAt,
      category,
      source,
      legacyId: item.id
    })
  })

  return { records, skipped }
}

export function buildProjectTimelineSeedRecords(filePath = legacyNotificationsPath) {
  const { records: legacyRecords, skipped } = readLegacyNotifications(filePath)
  return {
    records: [...legacyRecords, ...currentProjectRecords],
    skipped
  }
}

export function summarize(records = []) {
  return records.reduce((result, record) => {
    result[record.category] = (result[record.category] || 0) + 1
    return result
  }, {})
}

export async function runSeedProjectTimeline({ apply = applyChanges, filePath = legacyNotificationsPath } = {}) {
  const { records, skipped } = buildProjectTimelineSeedRecords(filePath)

  console.log(`旧通知文件：${filePath}`)
  console.log(`模式：${apply ? '写入数据库' : 'dry-run'}`)
  console.log(`待导入：${records.length} 条`)
  console.log(`跳过：${skipped.length} 条`)
  console.log('分类统计：', summarize(records))

  if (!apply) {
    console.log('dry-run 完成；传入 --apply 才会写入数据库。')
    return { records, skipped, inserted: 0, duplicated: 0 }
  }

  await connectDatabase()
  let inserted = 0
  let duplicated = 0

  try {
    for (const record of records) {
      const result = await upsertProjectTimelineSeedRecord(record)
      if (result.inserted || result.created) inserted += 1
      else duplicated += 1
    }
    console.log(`写入完成：新增 ${inserted} 条，已存在 ${duplicated} 条。`)
    return { records, skipped, inserted, duplicated }
  } finally {
    await disconnectDatabase()
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isCli) {
  runSeedProjectTimeline().catch(async (error) => {
    console.error(error)
    await disconnectDatabase()
    process.exitCode = 1
  })
}
