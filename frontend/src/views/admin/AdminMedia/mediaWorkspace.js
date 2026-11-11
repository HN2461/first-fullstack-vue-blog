// 页签描述的是查看目的；分类继续作为独立归档标签，不参与前端权限判定。
export const mediaWorkspaces = [
  { key: 'library', label: '素材库' },
  { key: 'business', label: '业务资源' },
  { key: 'all', label: '全部资源' },
  { key: 'trash', label: '回收站' }
]

export const resourceSceneOptions = [
  ['admin-library', '媒体素材'],
  ['article-cover', '文章封面'],
  ['article-content', '文章正文图片'],
  ['article-resource', '文章附件'],
  ['user-avatar', '用户头像'],
  ['resume-photo', '简历照片'],
  ['discussion-attachment', '讨论附件'],
  ['feedback-image', '意见反馈'],
  ['work-journal-evidence', '工作日志']
].map(([value, label]) => ({ value, label }))

export const resourceLifecycleOptions = [
  ['pending', '待保存 / 待清理'],
  ['attached', '已绑定业务'],
  ['retained', '长期保留素材']
].map(([value, label]) => ({ value, label }))

export const fileClassOptions = [
  { label: '图片', value: 'image' },
  { label: '文档', value: 'document' },
  { label: '代码', value: 'code' },
  { label: '压缩包 / 安装包', value: 'archive' },
  { label: '其他', value: 'other' }
]

/**
 * 将已有链接映射到页签，保留旧分类书签并允许浏览器前进后退。
 * @param {object} query 路由查询参数。
 * @returns {string} 受支持的工作区，普通链接默认进入素材库。
 * @throws {Error} 非法查询参数回退到默认工作区。
 */
export function resolveMediaWorkspace(query = {}) {
  if ([...mediaWorkspaces.map((item) => item.key), 'vault'].includes(query.tab)) return query.tab
  return query.categoryId || query.category || query.view === 'list' ? 'all' : 'library'
}

/**
 * 提前呈现业务保护原因，最终权限和删除引用仍由服务器复查。
 * @param {object} record 列表返回的资源信息。
 * @returns {{moveReason:string,deleteReason:string}} 不允许操作时的可读原因。
 * @throws {Error} 不执行外部操作。
 */
export function getMediaActionRestrictions(record = {}) {
  const managed =
    record.feedback ||
    ['user-avatar', 'resume-photo', 'discussion-attachment', 'work-journal-evidence', 'feedback-image'].includes(
      record.scene
    )
  return {
    moveReason: managed ? '由所属业务维护，请到对应业务修改' : '',
    deleteReason: record.usage?.referenceCount > 0 ? '仍有使用位置，请先查看使用位置并在对应业务中移除' : ''
  }
}

/**
 * 将文件字节数转换为资源界面显示大小。
 * @param {number} size 文件大小，缺省为 0。
 * @returns {string} 带单位的展示文本。
 * @throws {Error} 不执行外部操作。
 */
export function formatMediaSize(size = 0) {
  if (size >= 1024 ** 3) return `${(size / 1024 ** 3).toFixed(1)} GB`
  if (size >= 1024 ** 2) return `${(size / 1024 ** 2).toFixed(1)} MB`
  if (size >= 1024) return `${Math.ceil(size / 1024)} KB`
  return `${size} B`
}
