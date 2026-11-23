import { createHash } from 'node:crypto'
import { Article } from '../models/Article.js'
import { ArticleRevision } from '../models/ArticleRevision.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'
import { saveArticleResources, releaseArticleResources } from '#modules/media/services/articleResource.service.js'
import { syncArticleContentMediaBindings } from '#modules/media/services/articleContentMedia.service.js'
import { withResourceLocks } from '#modules/media/services/resourceLock.service.js'
import { assertArticlePublishable, calculateReadingMinutes, calculateWordCount, normalizeArticleResources } from './articleContent.service.js'
import { getNextArticleSortOrder } from './articleOrder.service.js'

function failure(statusCode, code, message) {
  return Object.assign(new Error(message), { statusCode, code })
}

function conflict() {
  return failure(409, 'ARTICLE_EDIT_CONFLICT', '文章或工作草稿已被更新，请核对最新版本后再保存')
}

function contentOf(input) {
  return {
    title: input.title.trim(), contentMarkdown: input.contentMarkdown || '', summary: input.summary || '',
    cover: input.cover || '', category: input.category ? String(input.category._id || input.category) : null,
    tags: (input.tags || []).map((item) => String(item._id || item)),
    isRecommended: !!input.isRecommended,
    resources: normalizeArticleResources(input.resources).map((item) => ({ ...item, mediaId: item.mediaId ? String(item.mediaId) : null }))
  }
}

function versionOf(article) {
  return article.publishedRevision ?? (article.publishedAt || article.status === 'published' ? 1 : 0)
}

function liveDigest(article) {
  return createHash('sha256').update(JSON.stringify([article.status, versionOf(article), contentOf(article)])).digest('hex')
}

function editToken(article) {
  // 批量改标题及权威仓库同步也会改正文。取实际内容摘要，浏览数等统计不应制造编辑冲突。
  const state = [article.editSequence || 0, liveDigest(article)]
  return createHash('sha256').update(JSON.stringify(state)).digest('hex')
}

function editorState(article) {
  const live = contentOf(article)
  return {
    id: String(article._id), status: article.status, contentMode: article.contentMode,
    publishedRevision: versionOf(article), token: editToken(article),
    published: versionOf(article) ? live : null,
    working: article.workingDraft ? contentOf(article.workingDraft) : live,
    baseChanged: Boolean(article.workingDraft?.base && article.workingDraft.base !== liveDigest(article))
  }
}

async function loadArticle(id) {
  const article = await Article.findOne({ _id: id, deletedAt: null }).select('+workingDraft')
  if (!article) throw failure(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  return article
}

/** 获取在线编辑状态。参数为文章 ID；返回编辑令牌、发布稿和工作稿，文章不存在时返回 404。 */
export async function getArticleEditor(id) {
  return editorState(await loadArticle(id))
}

async function compareAndSave(article, update) {
  const updated = await Article.findOneAndUpdate({
    _id: article._id, deletedAt: null, updatedAt: article.updatedAt ?? null, editSequence: article.editSequence ?? null
  }, { ...update, $inc: { editSequence: 1 } }, { returnDocument: 'after', runValidators: true }).select('+workingDraft')
  if (!updated) throw conflict()
  return updated
}

async function archiveCurrent(article, number) {
  const content = contentOf(article)
  // 先保护旧资源再切换发布稿。若进程中断，此编号在发布成功前不可见，再次发布会按相同编号重建。
  await saveArticleResources(article, null, () => ArticleRevision.updateOne({ articleId: article._id, number }, {
    $set: { content, savedBy: article.updatedBy, savedAt: article.revisionPublishedAt || article.publishedAt || article.updatedAt }
  }, { upsert: true }), 'revision:' + number)
}

async function adjustCounts(before, after) {
  if (String(before) === String(after)) return
  if (before) await Category.updateOne({ _id: before }, { $inc: { articleCount: -1 } })
  if (after) await Category.updateOne({ _id: after }, { $inc: { articleCount: 1 } })
}

async function storeEditingContent(article, content, user, publish) {
  const number = versionOf(article)
  const resourceArticle = { ...content, _id: article._id, createdBy: article.createdBy }
  if (!publish && number) {
    return saveArticleResources(resourceArticle, user, () => compareAndSave(article, {
      $set: { workingDraft: { ...content, base: liveDigest(article) } }
    }), 'workingDraft')
  }
  if (publish) {
    assertArticlePublishable(content)
    // 恢复旧版时，原分类或标签可能早已删除，须由作者重新选择有效条目。
    const [category, tagCount] = await Promise.all([
      Category.exists({ _id: content.category }),
      Tag.countDocuments({ _id: { $in: content.tags } })
    ])
    if (!category) throw failure(400, 'ARTICLE_CATEGORY_MISSING', '文章原分类已不存在，请重新选择')
    if (tagCount !== new Set(content.tags).size) throw failure(400, 'ARTICLE_TAG_MISSING', '部分标签已不存在，请重新选择')
  }
  if (publish && article.status === 'published' && JSON.stringify(content) === JSON.stringify(contentOf(article))) {
    if (!article.workingDraft) return article
    return releaseArticleResources(article._id, () => compareAndSave(article, { $unset: { workingDraft: 1 } }), 'workingDraft')
  }
  if (publish && number) await archiveCurrent(article, number)
  const wordCount = calculateWordCount(content.contentMarkdown)
  const values = { ...content, wordCount, readingMinutes: calculateReadingMinutes(wordCount), updatedBy: user._id }
  if (String(content.category) !== String(article.category)) {
    values.sortOrder = await getNextArticleSortOrder(content.category)
  }
  if (publish) {
    values.status = 'published'
    values.publishedRevision = number + 1
    values.publishedAt = article.publishedAt || new Date()
    values.revisionPublishedAt = new Date()
  }
  const updated = await saveArticleResources(resourceArticle, user, () => compareAndSave(article, {
    $set: values, $unset: { workingDraft: 1 }
  }))
  await adjustCounts(article.category, updated.category)
  await syncArticleContentMediaBindings(updated)
  if (article.workingDraft) await releaseArticleResources(article._id, async () => {}, 'workingDraft')
  return updated
}

/** 保存草稿或发布。参数为文章 ID、令牌、稿件、操作者及发布标志；返回新编辑状态，基准过期返回 409。 */
export async function saveArticleEdit(id, token, input, user, publish = false, acknowledgeBase = false) {
  return withResourceLocks(['article-editor:' + id], async () => {
    const article = await loadArticle(id)
    if (article.contentMode === 'document') throw failure(400, 'ARTICLE_DOCUMENT_READONLY', '文档文章不支持在线修改正文')
    if (token !== editToken(article)) throw conflict()
    if (!acknowledgeBase && article.workingDraft?.base && article.workingDraft.base !== liveDigest(article)) throw conflict()
    return editorState(await storeEditingContent(article, contentOf(input), user, publish))
  })
}

/** 旧发布入口也应用已经保存的工作稿，返回新编辑状态；无工作稿时返回 null，基准过期仍返回冲突。 */
export async function publishStoredDraft(article, user) {
  if (!article.workingDraft) return null
  return saveArticleEdit(String(article._id), editToken(article), article.workingDraft, user, true)
}

/** 分页读取单篇文章历史版本。参数为文章 ID 和前一页末尾版号；返回历史记录，只包含已替换的发布版本。 */
export async function listArticleRevisions(id, before) {
  const article = await loadArticle(id)
  const ceiling = Math.min(before || Infinity, versionOf(article))
  const rows = await ArticleRevision.find({ articleId: id, number: { $lt: ceiling } })
    .sort({ number: -1 }).limit(21).select('number savedAt savedBy').populate('savedBy', 'username').lean()
  return { items: rows.slice(0, 20).map((row) => ({
    number: row.number, savedAt: row.savedAt, author: row.savedBy?.username || ''
  })), hasMore: rows.length > 20 }
}

/** 获取指定旧版稿件。参数为文章 ID 和历史版号；返回结构化稿件，不存在或未完成发布时返回 404。 */
export async function getArticleRevision(id, number) {
  const article = await loadArticle(id)
  const revision = number < versionOf(article) && await ArticleRevision.findOne({ articleId: id, number }).lean()
  if (!revision) throw failure(404, 'ARTICLE_REVISION_NOT_FOUND', '文章历史版本不存在')
  return revision.content
}

/** 彻底删除文章时按版本释放引用。参数为文章 ID；返回完成状态，失败时可继续从剩余历史逐条重试。 */
export async function removeArticleRevisions(id) {
  await releaseArticleResources(id, async () => Article.updateOne({ _id: id, deletedAt: { $ne: null } }, { $unset: { workingDraft: 1 } }), 'workingDraft')
  for await (const record of ArticleRevision.find({ articleId: id }).select('number').cursor()) {
    await releaseArticleResources(id, () => ArticleRevision.deleteOne({ _id: record._id }), 'revision:' + record.number)
  }
}
