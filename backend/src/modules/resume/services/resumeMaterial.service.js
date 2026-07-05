import { ResumeMaterial } from '#modules/resume/models/ResumeMaterial.js'
import { assertObjectId, createResumeError, escapeRegExp, normalizeTags } from './resume.utils.js'

function buildMaterialQuery(userId, filters = {}) {
  const query = { ownerId: userId }
  const keyword = String(filters.keyword || '').trim()

  if (filters.category) {
    query.category = filters.category
  }

  if (filters.tag) {
    query.tags = filters.tag
  }

  if (keyword) {
    const regex = new RegExp(escapeRegExp(keyword), 'i')
    query.$or = [
      { title: regex },
      { category: regex },
      { relativePath: regex },
      { excerpt: regex },
      { content: regex },
      { tags: regex }
    ]
  }

  return query
}

async function findOwnedMaterial(id, userId) {
  assertObjectId(id, 'RESUME_MATERIAL_NOT_FOUND', '简历资料不存在')
  const material = await ResumeMaterial.findOne({ _id: id, ownerId: userId })
  if (!material) {
    throw createResumeError(404, 'RESUME_MATERIAL_NOT_FOUND', '简历资料不存在')
  }
  return material
}

export async function listResumeMaterials(userId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 10))
  const query = buildMaterialQuery(userId, filters)

  const [items, total] = await Promise.all([
    ResumeMaterial.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ResumeMaterial.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function getResumeMaterial(id, userId) {
  const material = await findOwnedMaterial(id, userId)
  return material.toSafeJSON({ includeContent: true })
}

export async function upsertResumeMaterial(userId, input) {
  const material = await ResumeMaterial.findOneAndUpdate(
    { ownerId: userId, sourceKey: input.sourceKey },
    {
      $set: {
        title: input.title,
        category: input.category || '简历资料',
        format: input.format || 'markdown',
        relativePath: input.relativePath,
        content: input.content || '',
        excerpt: input.excerpt || '',
        tags: normalizeTags(input.tags || []),
        checksum: input.checksum,
        fileSize: input.fileSize || 0,
        importedAt: new Date()
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  return material.toSafeJSON()
}
