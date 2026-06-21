import { z } from 'zod'
import {
  PROJECT_TIMELINE_CATEGORIES,
  PROJECT_TIMELINE_SOURCES
} from '#modules/projectTimeline/models/ProjectTimelineRecord.js'

export const projectTimelineCreateSchema = z.object({
  title: z.string().trim().min(1, '事件标题不能为空').max(160, '事件标题不能超过 160 个字符'),
  detail: z.string().trim().min(1, '事件详情不能为空').max(12000, '事件详情不能超过 12000 个字符'),
  occurredAt: z.string().trim().min(1, '请选择记录时间'),
  category: z.enum(PROJECT_TIMELINE_CATEGORIES).optional().default('手动记录'),
  source: z.enum(PROJECT_TIMELINE_SOURCES).optional().default('manual'),
  legacyId: z.string().trim().optional().default('')
})

const projectTimelineImportRecordSchema = z.object({
  id: z.string().trim().min(1, '记录 id 不能为空').max(120, '记录 id 不能超过 120 个字符'),
  title: z.string().trim().min(1, '事件标题不能为空').max(160, '事件标题不能超过 160 个字符'),
  detail: z.string().trim().min(1, '事件详情不能为空').max(12000, '事件详情不能超过 12000 个字符'),
  occurredAt: z.string().trim().optional().default(''),
  category: z.enum(PROJECT_TIMELINE_CATEGORIES).optional().default('功能更新')
})

export const projectTimelineImportSchema = z.object({
  schemaVersion: z.number().int().positive().optional().default(1),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, '导入日期格式应为 YYYY-MM-DD'),
  source: z.enum(PROJECT_TIMELINE_SOURCES).optional().default('collaboration_daily'),
  records: z.array(projectTimelineImportRecordSchema).min(1, '导入记录不能为空').max(100, '单个文件最多导入 100 条记录')
})
