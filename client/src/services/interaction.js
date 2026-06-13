import { request } from './http'

export function listComments(articleId) {
  return request(`/api/public/articles/${articleId}/comments`)
}

export function createComment(data) {
  return request('/api/comments', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function reportComment(id) {
  return request(`/api/comments/${id}/report`, {
    method: 'POST'
  })
}

export function likeArticle(id) {
  return request(`/api/articles/${id}/like`, {
    method: 'POST'
  })
}

export function unlikeArticle(id) {
  return request(`/api/articles/${id}/like`, {
    method: 'DELETE'
  })
}

export function favoriteArticle(id) {
  return request(`/api/articles/${id}/favorite`, {
    method: 'POST'
  })
}

export function unfavoriteArticle(id) {
  return request(`/api/articles/${id}/favorite`, {
    method: 'DELETE'
  })
}
