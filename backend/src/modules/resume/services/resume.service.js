import { Resume, createEmptyResumeSections } from '#modules/resume/models/Resume.js'
import { ResumeInterview } from '#modules/resume/models/ResumeInterview.js'
import { escapeRegExp, assertObjectId, createResumeError, normalizeSections } from './resume.utils.js'

function buildResumeQuery(userId, filters = {}) {
  const query = { ownerId: userId }
  const keyword = String(filters.keyword || '').trim()

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status
  }

  if (filters.templateKey) {
    query.templateKey = filters.templateKey
  }

  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), 'i')
    query.$or = [
      { title: regex },
      { targetRole: regex },
      { 'sections.profile.name': regex },
      { 'sections.profile.summary': regex }
    ]
  }

  return query
}

export async function findOwnedResume(id, userId) {
  assertObjectId(id, 'RESUME_NOT_FOUND', '简历不存在')
  const resume = await Resume.findOne({ _id: id, ownerId: userId })
  if (!resume) {
    throw createResumeError(404, 'RESUME_NOT_FOUND', '简历不存在')
  }
  return resume
}

export async function listResumes(userId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 10))
  const query = buildResumeQuery(userId, filters)

  const [items, total] = await Promise.all([
    Resume.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Resume.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function createResume(userId, input) {
  const resume = await Resume.create({
    ownerId: userId,
    title: input.title,
    targetRole: input.targetRole || '',
    templateKey: input.templateKey || 'classic',
    status: input.status || 'draft',
    sections: normalizeSections(input.sections || createEmptyResumeSections())
  })

  return resume.toSafeJSON()
}

export async function getResume(id, userId) {
  const resume = await findOwnedResume(id, userId)
  return resume.toSafeJSON()
}

export async function updateResume(id, userId, input) {
  const resume = await findOwnedResume(id, userId)

  if (input.title !== undefined) resume.title = input.title
  if (input.targetRole !== undefined) resume.targetRole = input.targetRole || ''
  if (input.templateKey !== undefined) resume.templateKey = input.templateKey || 'classic'
  if (input.status !== undefined) resume.status = input.status
  if (input.sections !== undefined) resume.sections = normalizeSections(input.sections)

  resume.version = (resume.version || 1) + 1
  await resume.save()
  return resume.toSafeJSON()
}

export async function duplicateResume(id, userId) {
  const resume = await findOwnedResume(id, userId)
  const copy = await Resume.create({
    ownerId: userId,
    title: `${resume.title} 副本`.slice(0, 80),
    targetRole: resume.targetRole || '',
    templateKey: resume.templateKey || 'classic',
    status: 'draft',
    sections: normalizeSections(JSON.parse(JSON.stringify(resume.sections || createEmptyResumeSections())))
  })

  return copy.toSafeJSON()
}

export async function deleteResume(id, userId) {
  const resume = await findOwnedResume(id, userId)
  await ResumeInterview.updateMany(
    { ownerId: userId, 'links.resumeId': resume._id },
    { $pull: { links: { resumeId: resume._id } } }
  )
  await resume.deleteOne()
  return { id: resume._id.toString(), deleted: true }
}
