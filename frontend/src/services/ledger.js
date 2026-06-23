import http from './http'
import { toPageResult } from './contracts'

export function listLedgerBooks(params = {}) {
  return http.get('/api/ledger/books', { params })
}

export function createLedgerBook(data) {
  return http.post('/api/ledger/books', data)
}

export function updateLedgerBook(id, data) {
  return http.patch(`/api/ledger/books/${id}`, data)
}

export function listLedgerCategories(params = {}) {
  return http.get('/api/ledger/categories', { params })
}

export function createLedgerCategory(data) {
  return http.post('/api/ledger/categories', data)
}

export function updateLedgerCategory(id, data) {
  return http.patch(`/api/ledger/categories/${id}`, data)
}

export async function listLedgerEntries(params = {}) {
  return toPageResult(await http.get('/api/ledger/entries', { params }), params.pageSize || 20)
}

export function createLedgerEntry(data) {
  return http.post('/api/ledger/entries', data)
}

export function updateLedgerEntry(id, data) {
  return http.patch(`/api/ledger/entries/${id}`, data)
}

export function batchUpdateLedgerEntries(data) {
  return http.patch('/api/ledger/entries/batch', data)
}

export function deleteLedgerEntry(id) {
  return http.delete(`/api/ledger/entries/${id}`)
}

export function getLedgerSummary(params = {}) {
  return http.get('/api/ledger/summary', { params })
}

export function getLedgerDaily(params = {}) {
  return http.get('/api/ledger/daily', { params })
}

export async function listLedgerImports(params = {}) {
  return toPageResult(await http.get('/api/ledger/imports', { params }), params.pageSize || 20)
}

export function previewLedgerImport(bookId, file) {
  const formData = new FormData()
  formData.append('bookId', bookId)
  formData.append('file', file)
  return http.post('/api/ledger/imports/preview', formData)
}

export function commitLedgerImport(id) {
  return http.post(`/api/ledger/imports/${id}/commit`)
}

export async function listLedgerMoments(params = {}) {
  return toPageResult(await http.get('/api/ledger/moments', { params }), params.pageSize || 20)
}

export function createLedgerMoment(data) {
  return http.post('/api/ledger/moments', data)
}

export function updateLedgerMoment(id, data) {
  return http.patch(`/api/ledger/moments/${id}`, data)
}

export function deleteLedgerMoment(id) {
  return http.delete(`/api/ledger/moments/${id}`)
}
