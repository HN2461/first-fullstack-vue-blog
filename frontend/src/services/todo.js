import http from './http'

export function listTodoLists(params = {}) {
  return http.get('/api/todos', { params })
}

export function getTodoStats() {
  return http.get('/api/todos/stats')
}

export function getTodoList(id) {
  return http.get(`/api/todos/${id}`)
}

export function createTodoList(data) {
  return http.post('/api/todos', data)
}

export function updateTodoList(id, data) {
  return http.patch(`/api/todos/${id}`, data)
}

export function deleteTodoList(id) {
  return http.delete(`/api/todos/${id}`)
}

export function createTodoItem(listId, data) {
  return http.post(`/api/todos/${listId}/items`, data)
}

export function updateTodoItem(listId, itemId, data) {
  return http.patch(`/api/todos/${listId}/items/${itemId}`, data)
}

export function deleteTodoItem(listId, itemId) {
  return http.delete(`/api/todos/${listId}/items/${itemId}`)
}
