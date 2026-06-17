import http from './http'

export function listComments(articleId) {
  return http.get(`/api/public/articles/${articleId}/comments`)
}

export function createComment(data) {
  return http.post('/api/comments', data)
}

export function reportComment(id) {
  return http.post(`/api/comments/${id}/report`)
}

export function likeArticle(id) {
  return http.post(`/api/articles/${id}/like`)
}

export function unlikeArticle(id) {
  return http.delete(`/api/articles/${id}/like`)
}

export function favoriteArticle(id) {
  return http.post(`/api/articles/${id}/favorite`)
}

export function unfavoriteArticle(id) {
  return http.delete(`/api/articles/${id}/favorite`)
}
