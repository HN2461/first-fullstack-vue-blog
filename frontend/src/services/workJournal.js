import http from './http'

export function listEmployments() {
  return http.get('/api/work-journal/employments')
}

export function createEmployment(data) {
  return http.post('/api/work-journal/employments', data)
}

export function updateEmployment(id, data) {
  return http.patch(`/api/work-journal/employments/${id}`, data)
}

export function deleteEmployment(id) {
  return http.delete(`/api/work-journal/employments/${id}`)
}

export function listWorkLogs(params = {}) {
  return http.get('/api/work-journal/logs', { params })
}

/**
 * 按当前登录用户读取单条日报，用于从媒体引用定位到日报详情。
 * @param {string} id 日报 ID。
 * @returns {Promise<object>} 日报详情。
 * @throws {Error} 日报不存在或不属于当前用户时由接口返回访问错误。
 */
export function getWorkLog(id) {
  return http.get(`/api/work-journal/logs/${id}`)
}

export function listTrashedWorkLogs(params = {}) {
  return http.get('/api/work-journal/trash', { params })
}

export function createWorkLog(data) {
  return http.post('/api/work-journal/logs', data)
}

export function updateWorkLog(id, data) {
  return http.patch(`/api/work-journal/logs/${id}`, data)
}

export function deleteWorkLog(id, options = {}) {
  return options.permanent
    ? http.delete(`/api/work-journal/logs/${id}/permanent`)
    : http.delete(`/api/work-journal/logs/${id}`)
}

export function restoreWorkLog(id) {
  return http.post(`/api/work-journal/logs/${id}/restore`)
}

export function uploadWorkEvidence(logId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post(`/api/work-journal/logs/${logId}/evidence`, formData)
}

export function getWorkEvidence(logId, evidenceId) {
  return http.get(`/api/work-journal/logs/${logId}/evidence/${evidenceId}`, { responseType: 'blob' })
}

export function deleteWorkEvidence(logId, evidenceId) {
  return http.delete(`/api/work-journal/logs/${logId}/evidence/${evidenceId}`)
}

export function getWorkReport(params) {
  return http.get('/api/work-journal/reports', { params })
}

export function listWorkReports(params = {}) {
  return http.get('/api/work-journal/saved-reports', { params })
}

export function createWorkReport(data) {
  return http.post('/api/work-journal/saved-reports', data)
}

export function updateWorkReport(id, data) {
  return http.patch(`/api/work-journal/saved-reports/${id}`, data)
}

export function deleteWorkReport(id) {
  return http.delete(`/api/work-journal/saved-reports/${id}`)
}

export function exportWorkJournal(params) {
  return http.get('/api/work-journal/export', { params, responseType: 'blob' })
}
