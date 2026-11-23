import http from './http'

/** 读取文章工作稿和版本令牌。参数为文章 ID，返回编辑状态，权限不足或文章不可读时抛出请求错误。 */
export function getArticleEditor(id) {
  return http.get(`/api/admin/articles/${id}/editor`)
}

/** 提交基于令牌编辑的稿件。返回新状态；并发冲突时保留页面输入，由作者核对冲突后继续。 */
export function saveArticleEdit(id, token, content, publish = false, acknowledgeBase = false) {
  return http.put(`/api/admin/articles/${id}/editor/${publish ? 'publish' : 'draft'}`, { token, content, acknowledgeBase })
}

/** 读取历史版号列表，before 为空时从最新起。返回分页记录，权限错误向上抛出。 */
export function listArticleRevisions(id, before) {
  return http.get(`/api/admin/articles/${id}/revisions`, { params: { before } })
}

/** 根据文章 ID、版号返回历史稿件，版本不存在时抛出请求错误。 */
export function getArticleRevision(id, number) {
  return http.get(`/api/admin/articles/${id}/revisions/${number}`)
}
