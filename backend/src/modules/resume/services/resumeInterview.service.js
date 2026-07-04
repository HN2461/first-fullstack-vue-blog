import { ResumeInterview } from '#modules/resume/models/ResumeInterview.js'
import { assertObjectId, createResumeError, escapeRegExp, normalizeTags } from './resume.utils.js'
import { findOwnedResume } from './resume.service.js'

function sameLink(left = {}, right = {}) {
  return String(left.resumeId || '') === String(right.resumeId || '') &&
    String(left.sectionKey || '') === String(right.sectionKey || '') &&
    String(left.entryId || '') === String(right.entryId || '') &&
    String(left.highlightId || '') === String(right.highlightId || '')
}

async function normalizeLinks(userId, links = []) {
  const normalized = []

  for (const link of links) {
    const resume = await findOwnedResume(link.resumeId, userId)
    const next = {
      resumeId: resume._id,
      sectionKey: link.sectionKey,
      entryId: link.entryId || '',
      highlightId: link.highlightId || '',
      excerpt: link.excerpt || ''
    }

    if (!normalized.some((item) => sameLink(item, next))) {
      normalized.push(next)
    }
  }

  return normalized
}

function buildInterviewQuery(userId, filters = {}) {
  const query = { ownerId: userId }
  const keyword = String(filters.keyword || '').trim()

  if (filters.tag) {
    query.tags = filters.tag
  }

  if (filters.resumeId) {
    query['links.resumeId'] = filters.resumeId
  }

  if (filters.sectionKey) query['links.sectionKey'] = filters.sectionKey
  if (filters.entryId) query['links.entryId'] = filters.entryId
  if (filters.highlightId) query['links.highlightId'] = filters.highlightId

  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), 'i')
    query.$or = [
      { question: regex },
      { answerOutline: regex },
      { polishedAnswer: regex },
      { tags: regex },
      { 'links.excerpt': regex }
    ]
  }

  return query
}

async function findOwnedInterview(id, userId) {
  assertObjectId(id, 'INTERVIEW_NOT_FOUND', '面试问答不存在')
  const interview = await ResumeInterview.findOne({ _id: id, ownerId: userId })
  if (!interview) {
    throw createResumeError(404, 'INTERVIEW_NOT_FOUND', '面试问答不存在')
  }
  return interview
}

export async function listInterviews(userId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 10))
  const query = buildInterviewQuery(userId, filters)

  const [items, total] = await Promise.all([
    ResumeInterview.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ResumeInterview.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function createInterview(userId, input) {
  const interview = await ResumeInterview.create({
    ownerId: userId,
    question: input.question,
    answerOutline: input.answerOutline || '',
    polishedAnswer: input.polishedAnswer || '',
    tags: normalizeTags(input.tags),
    difficulty: input.difficulty || 'medium',
    links: await normalizeLinks(userId, input.links || [])
  })

  return interview.toSafeJSON()
}

export async function getInterview(id, userId) {
  const interview = await findOwnedInterview(id, userId)
  return interview.toSafeJSON()
}

export async function updateInterview(id, userId, input) {
  const interview = await findOwnedInterview(id, userId)

  if (input.question !== undefined) interview.question = input.question
  if (input.answerOutline !== undefined) interview.answerOutline = input.answerOutline || ''
  if (input.polishedAnswer !== undefined) interview.polishedAnswer = input.polishedAnswer || ''
  if (input.tags !== undefined) interview.tags = normalizeTags(input.tags)
  if (input.difficulty !== undefined) interview.difficulty = input.difficulty
  if (input.links !== undefined) interview.links = await normalizeLinks(userId, input.links)

  await interview.save()
  return interview.toSafeJSON()
}

export async function addInterviewLink(id, userId, link) {
  const interview = await findOwnedInterview(id, userId)
  const [normalized] = await normalizeLinks(userId, [link])
  if (!normalized) return interview.toSafeJSON()

  const exists = (interview.links || []).some((item) => sameLink(item, normalized))
  if (!exists) {
    interview.links.push(normalized)
    await interview.save()
  }

  return interview.toSafeJSON()
}

export async function removeInterviewLink(id, userId, link) {
  const interview = await findOwnedInterview(id, userId)
  interview.links = (interview.links || []).filter((item) => !sameLink(item, link))
  await interview.save()
  return interview.toSafeJSON()
}

export async function deleteInterview(id, userId) {
  const interview = await findOwnedInterview(id, userId)
  await interview.deleteOne()
  return { id: interview._id.toString(), deleted: true }
}
