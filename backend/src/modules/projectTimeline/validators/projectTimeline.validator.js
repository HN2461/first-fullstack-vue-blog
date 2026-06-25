import { z } from 'zod'
import {
  PROJECT_TIMELINE_CATEGORIES,
  PROJECT_TIMELINE_SOURCES
} from '#modules/projectTimeline/models/ProjectTimelineRecord.js'

// 常见分类名近义词 → 标准分类的自动映射，导入时遇到会自动纠正
const CATEGORY_ALIASES = {
  '功能新增': '功能更新',
  '新功能': '功能更新',
  '新增功能': '功能更新',
  '功能优化': '功能更新',
  'bug修复': '问题修复',
  'bug': '问题修复',
  '修复': '问题修复',
  '部署': '部署发布',
  '发布': '部署发布',
  '上线': '部署发布',
  '搭建': '项目搭建',
  '初始化': '项目搭建',
  '公告': '系统公告',
  '通知': '系统公告',
  '上新': '内容上新',
  '内容更新': '内容上新',
  '版本': '版本调整',
  '版本变更': '版本调整',
  '手动': '手动记录',
  '其他': '手动记录',
  '杂项': '手动记录'
}

function normalizeCategory(value) {
  if (!value || typeof value !== 'string') return value
  const trimmed = value.trim()
  // 精确匹配则直接返回
  if (PROJECT_TIMELINE_CATEGORIES.includes(trimmed)) return trimmed
  // 尝试别名映射
  const mapped = CATEGORY_ALIASES[trimmed]
  if (mapped) return mapped
  // 未匹配的分类视为自定义分类，保留原值。
  return trimmed
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed || undefined
}

const projectTimelineCategorySchema = z.preprocess(
  (value) => normalizeOptionalString(normalizeCategory(value)),
  z.string().min(1, '记录分类不能为空').max(40, '记录分类不能超过 40 个字符').optional()
)

export const projectTimelineCreateSchema = z.object({
  title: z.string().trim().min(1, '事件标题不能为空').max(160, '事件标题不能超过 160 个字符'),
  detail: z.string().trim().min(1, '事件详情不能为空').max(12000, '事件详情不能超过 12000 个字符'),
  occurredAt: z.string().trim().min(1, '请选择记录时间'),
  category: projectTimelineCategorySchema.default('手动记录'),
  source: z.enum(PROJECT_TIMELINE_SOURCES).optional().default('manual'),
  legacyId: z.string().trim().optional().default('')
})

const projectTimelineImportRecordSchema = z.object({
  id: z.string().trim().min(1, '记录 id 不能为空').max(120, '记录 id 不能超过 120 个字符'),
  title: z.string().trim().min(1, '事件标题不能为空').max(160, '事件标题不能超过 160 个字符'),
  detail: z.string().trim().min(1, '事件详情不能为空').max(12000, '事件详情不能超过 12000 个字符'),
  occurredAt: z.string().trim().optional().default(''),
  // 导入时自动纠正近似分类名；未命中推荐分类时保留为自定义分类，避免台账导入被枚举卡死。
  category: projectTimelineCategorySchema.default('功能更新')
})

export const projectTimelineImportSchema = z.object({
  schemaVersion: z.number().int().positive().optional().default(1),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, '导入日期格式应为 YYYY-MM-DD'),
  source: z.enum(PROJECT_TIMELINE_SOURCES).optional().default('collaboration_daily'),
  records: z.array(projectTimelineImportRecordSchema).min(1, '导入记录不能为空').max(100, '单个文件最多导入 100 条记录')
})
