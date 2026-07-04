import http from './http'
import { toPageResult } from './contracts'

export async function listResumes(params = {}) {
  return toPageResult(await http.get('/api/resumes', { params }), params.pageSize || 10)
}

export function createResume(data) {
  return http.post('/api/resumes', data)
}

export function getResume(id) {
  return http.get(`/api/resumes/${id}`)
}

export function updateResume(id, data) {
  return http.patch(`/api/resumes/${id}`, data)
}

export function duplicateResume(id) {
  return http.post(`/api/resumes/${id}/duplicate`)
}

export function deleteResume(id) {
  return http.delete(`/api/resumes/${id}`)
}

export async function listResumeInterviews(params = {}) {
  return toPageResult(await http.get('/api/resume-interviews', { params }), params.pageSize || 10)
}

export function createResumeInterview(data) {
  return http.post('/api/resume-interviews', data)
}

export function getResumeInterview(id) {
  return http.get(`/api/resume-interviews/${id}`)
}

export function updateResumeInterview(id, data) {
  return http.patch(`/api/resume-interviews/${id}`, data)
}

export function deleteResumeInterview(id) {
  return http.delete(`/api/resume-interviews/${id}`)
}

export function addResumeInterviewLink(id, data) {
  return http.post(`/api/resume-interviews/${id}/links`, data)
}

export function removeResumeInterviewLink(id, data) {
  return http.delete(`/api/resume-interviews/${id}/links`, { data })
}

export function listResumeTemplates() {
  return http.get('/api/resume-templates')
}

export function getResumeTemplate(key) {
  return http.get(`/api/resume-templates/${key}`)
}

export async function listResumeExports(params = {}) {
  return toPageResult(await http.get('/api/resume-exports', { params }), params.pageSize || 10)
}

export function createResumeExport(data) {
  return http.post('/api/resume-exports', data)
}

export function downloadResumeExport(id) {
  return http.get(`/api/resume-exports/${id}/download`, {
    responseType: 'blob'
  })
}
