import http from './http'
import { toPageResult } from './contracts'

export async function listMemos(params = {}) {
  return toPageResult(await http.get('/api/memos', { params }), params.pageSize || 12)
}

export function getMemoStats() {
  return http.get('/api/memos/stats')
}

export function createMemo(data) {
  return http.post('/api/memos', data)
}

export function updateMemo(id, data) {
  return http.patch(`/api/memos/${id}`, data)
}

export function deleteMemo(id) {
  return http.delete(`/api/memos/${id}`)
}
