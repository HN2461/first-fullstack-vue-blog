import { z } from 'zod'
import { Article } from '#modules/content/models/Article.js'
import { getBusinessDate } from '#utils/businessDate.js'
import { parseBody } from '#modules/content/validators/content.validator.js'

const calendarDate = z.string().refine((value) => {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}, '请输入有效的日期')

const reviewSchema = z.object({
  audience: z.enum(['members', 'public']),
  applicableVersion: z.string().trim().max(100),
  verifiedOn: calendarDate,
  nextReviewOn: calendarDate,
  expectedUpdatedAt: z.string().datetime()
}).strict().refine((v) => v.verifiedOn <= getBusinessDate(), '上次核验日期不能在未来')
  .refine((v) => !v.nextReviewOn || v.nextReviewOn >= v.verifiedOn, '下次复核不可早于上次核验')

/**
 * 更新作者确认的文章受众与核验日期。id 为文章身份，body 包含列表读取的更新时间。
 * 返回最新文章元数据；旧窗口、已删除记录及无效日期不会覆盖当前决定。
 */
export async function saveArticleReview(id, body, userId) {
  const { expectedUpdatedAt, ...settings } = parseBody(reviewSchema, body)
  const article = await Article.findOneAndUpdate(
    { _id: id, deletedAt: null, updatedAt: new Date(expectedUpdatedAt) },
    { $set: { ...settings, updatedBy: userId } },
    { returnDocument: 'after', runValidators: true }
  )
  if (!article) {
    throw Object.assign(new Error('文章已变更或删除，请刷新后重新核对'), { statusCode: 409, code: 'ARTICLE_REVIEW_CONFLICT' })
  }
  return article.toSafeJSON({ includeContent: false, includeResources: false })
}
