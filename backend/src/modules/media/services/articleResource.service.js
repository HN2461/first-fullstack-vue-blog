import { Media } from '../models/Media.js'
import { extractArticleContentMediaUrls } from './articleContentMedia.service.js'
import { saveResourceBindings } from './resourceBinding.service.js'
import { resourceError } from '../constants/resourceScenes.js'
import { getResourcePath, getResourceId } from './resourceIdentity.service.js'

/**
 * 文章保存前收集封面、正文、附件及原文档，登记完整引用并禁止私有资源公开挂载。
 * @param {object} article 待保存文章。
 * @param {object} actor 当前作者或管理员。
 * @param {Function} save 文章保存回调。
 * @returns {Promise<*>} 保存结果；不存在的历史外链继续按外链处理。
 * @throws {Error} 受管文件已删除、私有或不存在时拒绝保存。
 */
export async function saveArticleResources(article, actor, save) {
  const sourceUrls = [article.cover, ...extractArticleContentMediaUrls(article.contentMarkdown),
    ...(article.resources || []).map((item) => item.url), article.document?.originalUrl, article.document?.previewUrl].filter(Boolean)
  const urls = [...new Set(sourceUrls.flatMap((url) => [url, getResourcePath(url)]).filter(Boolean))]
  const ids = [...(article.resources || []).map((item) => item.mediaId), article.document?.originalMediaId, article.document?.previewMediaId].filter(Boolean).map(String)
  for (const url of urls) {
    const id = getResourceId(url)
    if (id) ids.push(id)
  }
  const media = await Media.find({ $or: [{ url: { $in: urls } }, { _id: { $in: ids } }] })
  const found = new Set(media.map((item) => String(item._id)))
  if (ids.some((id) => !found.has(id))) throw resourceError(400, 'ARTICLE_RESOURCE_MISSING', '部分文章文件不存在，请重新选择')
  return saveResourceBindings({
    targetType: 'article', targetId: article._id, field: 'resources', ownerId: article.createdBy || actor?._id,
    mediaIds: media.map((item) => item._id), state: article.deletedAt ? 'retained' : 'active',
    validate: (item) => {
      if (item.accessScope !== 'public') throw resourceError(403, 'ARTICLE_PRIVATE_RESOURCE', '私人附件不能直接用于文章，请选择公开素材')
    }
  }, save)
}

/**
 * 彻底删除文章时解除其文件关系，其余业务的引用继续保留。
 * @param {string} articleId 服务端确认的文章 ID。
 * @param {Function} save 执行文章删除的持久化回调。
 * @returns {Promise<*>} 回调结果。
 * @throws {Error} 删除或引用更新失败时抛出，遵循保守保留规则。
 */
export function releaseArticleResources(articleId, save) {
  return saveResourceBindings({ targetType: 'article', targetId: articleId, field: 'resources', mediaIds: [] }, save)
}
