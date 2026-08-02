import http from './http'
import { toPageResult } from './contracts'

export function getQuestionBankOverview() {
  return http.get('/api/question-bank/overview')
}

export function listQuestionCategories(params = {}) {
  return http.get('/api/question-bank/categories', { params })
}

export function createQuestionCategory(data) {
  return http.post('/api/question-bank/categories', data)
}

export function updateQuestionCategory(id, data) {
  return http.patch(`/api/question-bank/categories/${id}`, data)
}

export async function listQuestions(params = {}) {
  return toPageResult(await http.get('/api/question-bank/questions', { params }), params.pageSize || 20)
}

export function getQuestion(id) {
  return http.get(`/api/question-bank/questions/${id}`)
}

export function createQuestion(data) {
  return http.post('/api/question-bank/questions', data)
}

export function updateQuestion(id, data) {
  return http.patch(`/api/question-bank/questions/${id}`, data)
}

export function archiveQuestion(id) {
  return http.delete(`/api/question-bank/questions/${id}`)
}

export async function listQuestionPapers(params = {}) {
  return toPageResult(await http.get('/api/question-bank/papers', { params }), params.pageSize || 10)
}

export function getQuestionPaper(id) {
  return http.get(`/api/question-bank/papers/${id}`)
}

export function createQuestionPaper(data) {
  return http.post('/api/question-bank/papers', data)
}

export function updateQuestionPaper(id, data) {
  return http.patch(`/api/question-bank/papers/${id}`, data)
}

export function archiveQuestionPaper(id) {
  return http.delete(`/api/question-bank/papers/${id}`)
}

export function startQuestionPaper(id) {
  return http.post(`/api/question-bank/papers/${id}/start`)
}

export function startQuickAttempt(data) {
  return http.post('/api/question-bank/attempts/quick', data)
}

export async function listQuestionAttempts(params = {}) {
  return toPageResult(await http.get('/api/question-bank/attempts', { params }), params.pageSize || 10)
}

export function getQuestionAttempt(id) {
  return http.get(`/api/question-bank/attempts/${id}`)
}

export function saveQuestionAnswer(id, data) {
  return http.patch(`/api/question-bank/attempts/${id}/answer`, data)
}

export function submitQuestionAttempt(id, data = {}) {
  return http.post(`/api/question-bank/attempts/${id}/submit`, data)
}

export async function listQuestionProgress(params = {}) {
  return toPageResult(await http.get('/api/question-bank/progress', { params }), params.pageSize || 20)
}

export function setQuestionFavorite(questionId, isFavorite) {
  return http.patch(`/api/question-bank/progress/${questionId}/favorite`, { isFavorite })
}
