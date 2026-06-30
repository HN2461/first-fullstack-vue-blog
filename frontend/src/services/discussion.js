import http from './http'

export function getDiscussionConfig() {
  return http.get('/api/discussions/config')
}

export function listDiscussionUsers(params = {}) {
  return http.get('/api/discussions/users', { params })
}

export function listDiscussionThreads() {
  return http.get('/api/discussions')
}

export function createDiscussionThread(data) {
  return http.post('/api/discussions', data)
}

export function getDiscussionThread(id) {
  return http.get(`/api/discussions/${id}`)
}

export function listDiscussionMessages(threadId, params = {}) {
  return http.get(`/api/discussions/${threadId}/messages`, { params })
}

export function createDiscussionMessage(threadId, data) {
  return http.post(`/api/discussions/${threadId}/messages`, data)
}

export function uploadDiscussionAttachment(threadId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post(`/api/discussions/${threadId}/attachments`, formData)
}

export function getDiscussionStorage(threadId) {
  return http.get(`/api/discussions/${threadId}/storage`)
}

export function clearDiscussionThreadForMe(threadId) {
  return http.post(`/api/discussions/${threadId}/clear-my-view`)
}

export function purgeDiscussionThread(threadId) {
  return http.post(`/api/discussions/${threadId}/admin/purge`)
}

export function purgeAllDiscussionMessages() {
  return http.post('/api/discussions/admin/purge-all')
}

export function deleteDiscussionMessage(threadId, messageId) {
  return http.delete(`/api/discussions/${threadId}/messages/${messageId}`)
}

export function hideDiscussionMessage(threadId, messageId) {
  return http.post(`/api/discussions/${threadId}/messages/${messageId}/hide`)
}

export function revokeDiscussionMessage(threadId, messageId) {
  return http.post(`/api/discussions/${threadId}/messages/${messageId}/revoke`)
}

export function markDiscussionRead(threadId) {
  return http.post(`/api/discussions/${threadId}/read`)
}
