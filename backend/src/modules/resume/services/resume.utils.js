import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { createEmptyResumeSections } from '#modules/resume/models/Resume.js'

export function createResumeError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function assertObjectId(id, code = 'RESOURCE_NOT_FOUND', message = '资源不存在') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createResumeError(404, code, message)
  }
}

export function normalizeTags(tags = []) {
  const seen = new Set()
  return tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

export function normalizeSortableItems(items = [], nestedKeys = []) {
  return items.map((item, index) => {
    const next = {
      ...item,
      id: item.id || crypto.randomUUID(),
      sortOrder: Number.isInteger(item.sortOrder) ? item.sortOrder : index * 10
    }

    for (const key of nestedKeys) {
      next[key] = normalizeSortableItems(next[key] || [])
    }

    return next
  }).sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
}

export function normalizeSections(sections = {}) {
  const empty = createEmptyResumeSections()
  const next = {
    profile: {
      ...empty.profile,
      ...(sections.profile || {})
    },
    advantages: normalizeSortableItems(sections.advantages || []),
    skills: normalizeSortableItems(sections.skills || []),
    education: normalizeSortableItems(sections.education || []),
    workExperiences: normalizeSortableItems(sections.workExperiences || [], ['achievements']),
    projects: normalizeSortableItems(sections.projects || [], ['highlights']),
    selfEvaluation: normalizeSortableItems(sections.selfEvaluation || [])
  }

  return next
}

export function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function safeFilename(value = 'resume') {
  const cleaned = String(value || 'resume')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80)

  return cleaned || 'resume'
}

export function formatCompactDate(date = new Date()) {
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}
