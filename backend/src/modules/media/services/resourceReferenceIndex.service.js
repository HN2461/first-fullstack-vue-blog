import { MediaReference } from '../models/MediaReference.js'

const types = {
  user: ['userAvatar', '用户头像', '/console/manage/users'],
  resume: ['resumePhoto', '简历照片', '/console/resumes'],
  'discussion-message': ['discussionAttachment', '讨论附件', '/console/discussions'],
  'work-log': ['workJournalEvidence', '工作日志凭证', '/console/work-journal/daily'],
  feedback: ['feedbackAttachment', '意见反馈图片', '/console/manage/feedback'],
  article: ['articleResource', '文章资源', '/console/manage/articles']
}

/**
 * 查询结构化业务引用并转换为媒体管理可显示的格式。
 * @param {string} mediaId 文件 ID。
 * @returns {Promise<Array<object>>} 反向引用记录，保守 pending 引用仍保护文件。
 * @throws {Error} 数据库不可用时抛出，调用方不能当作无引用继续删除。
 */
export async function getIndexedResourceReferences(mediaId) {
  if (!mediaId) return []
  const refs = await MediaReference.find({ mediaId }).lean()
  return refs.map(describeReference)
}

function describeReference(ref) {
  const [type, typeLabel, basePath] = types[ref.targetType] || ['businessResource', '业务附件', '']
  const routePath = ref.targetType === 'resume' ? '/console/resumes/editor'
    : ref.targetType === 'article' ? `/console/manage/articles/${ref.targetId}/read` : basePath
  return {
    type, typeLabel, ownerId: ref.targetId, ownerTitle: `${typeLabel}（${ref.field}）`,
    ownerSubtitle: ref.targetId, ownerUserId: ref.ownerId?.toString() || '', routePath,
    routeQuery: ref.targetType === 'resume' ? { id: ref.targetId } : {},
    status: ref.state, updatedAt: ref.updatedAt
  }
}

/**
 * 分页列表批量读取引用，避免为每一行单独查询。
 * @param {Array<string>} ids 本页文件 ID。
 * @returns {Promise<Map<string,Array>>} 按文件 ID 分组的引用。
 * @throws {Error} 查询失败时抛出。
 */
export async function getIndexedResourceReferenceMap(ids) {
  const map = new Map(ids.map((id) => [String(id), []]))
  const refs = await MediaReference.find({ mediaId: { $in: ids } }).lean()
  for (const ref of refs) map.get(String(ref.mediaId))?.push(describeReference(ref))
  return map
}

/**
 * 合并索引和历史扫描，避免同一业务在迁移期间重复显示。
 * @param {Array} scanned 历史扫描引用。
 * @param {Array} indexed 结构化引用。
 * @returns {Array} 去重后的引用。
 * @throws {Error} 不执行外部操作。
 */
export function mergeResourceReferences(scanned, indexed) {
  const keys = new Set(scanned.map((ref) => `${ref.type}:${ref.ownerId}`))
  return [...scanned, ...filterIndexedResourceReferences(indexed, keys)]
}

/**
 * 索引是业务反向查询的兜底，同一文章已有封面、正文或附件详情时不再增加一条笼统引用。
 * @param {Array<object>} indexed 索引引用。
 * @param {Set<string>} scannedKeys 已扫描的类型与业务 ID。
 * @returns {Array<object>} 尚未被业务扫描表达的索引引用。
 * @throws {Error} 不执行外部操作。
 */
export function filterIndexedResourceReferences(indexed, scannedKeys) {
  return indexed.filter((ref) => {
    if (scannedKeys.has(`${ref.type}:${ref.ownerId}`)) return false
    if (ref.type === 'articleResource' && ['articleContent', 'articleCover', 'articleResource', 'articleDocument', 'articleDocumentPreview']
      .some((type) => scannedKeys.has(`${type}:${ref.ownerId}`))) return false
    return true
  })
}
