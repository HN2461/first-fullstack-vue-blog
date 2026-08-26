import http from './http'

export function listArticleReadingProgress(params = {}) {
  return http.get('/api/articles/reading-progress', { params })
}

export function getArticleReadingProgress(articleId) {
  return http.get(`/api/articles/${articleId}/reading-progress`)
}

export function saveArticleReadingProgress(articleId, data) {
  return http.put(`/api/articles/${articleId}/reading-progress`, data)
}

export function deleteArticleReadingProgress(articleId) {
  return http.delete(`/api/articles/${articleId}/reading-progress`)
}
