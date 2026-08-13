import mongoose from 'mongoose'
import { env } from '#config/env'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { SYSTEM_MEDIA_CATEGORIES } from '#modules/media/services/mediaCategory.service.js'
import { User } from '#modules/user/models/User.js'

const apply = process.argv.includes('--apply')
const verifyOnly = process.argv.includes('--verify')
const systemByName = new Map(SYSTEM_MEDIA_CATEGORIES.map((item) => [item.name, item]))

function idString(value) {
  return value?.toString?.() || ''
}

function normalizedName(value) {
  return String(value || '').trim() || '默认素材'
}

function categoryKey(owner, name) {
  return `${idString(owner)}:${name}`
}

function compareCreatedAt(left, right) {
  return new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
}

function chooseCategory(candidates, owner = null) {
  const ownerId = idString(owner)
  return [...candidates].sort((left, right) => {
    const leftExact = idString(left.owner) === ownerId ? 1 : 0
    const rightExact = idString(right.owner) === ownerId ? 1 : 0
    if (leftExact !== rightExact) return rightExact - leftExact
    return compareCreatedAt(left, right)
  })[0]
}

async function loadMediaGroups() {
  const rows = await Media.aggregate([
    {
      $group: {
        _id: { uploader: '$uploader', category: '$category' },
        count: { $sum: 1 }
      }
    }
  ])

  return rows.map((row) => ({
    owner: row._id.uploader,
    rawName: row._id.category,
    name: normalizedName(row._id.category),
    count: row.count
  }))
}

async function findFallbackOwner() {
  return User.findOne({ role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] } })
    .sort({ role: 1, createdAt: 1 })
    .select('_id')
    .lean()
}

async function buildMigrationPlan() {
  const [existingCategories, mediaGroups, fallbackOwner] = await Promise.all([
    MediaCategory.find().sort({ createdAt: 1 }).lean(),
    loadMediaGroups(),
    findFallbackOwner()
  ])
  const planned = new Map()
  const plannedKeys = new Map()
  const assignedExistingIds = new Set()
  const mediaAssignments = []

  for (const definition of SYSTEM_MEDIA_CATEGORIES) {
    const candidates = existingCategories.filter((item) => item.name === definition.name)
    const canonical = chooseCategory(candidates.filter((item) => item.system === true)) || chooseCategory(candidates)
    const id = canonical?._id || new mongoose.Types.ObjectId()
    planned.set(idString(id), {
      _id: id,
      ...definition,
      owner: null,
      system: true
    })
    plannedKeys.set(categoryKey(null, definition.name), idString(id))
    if (canonical) assignedExistingIds.add(idString(canonical._id))
  }

  for (const group of mediaGroups) {
    if (systemByName.has(group.name)) {
      const categoryId = plannedKeys.get(categoryKey(null, group.name))
      mediaAssignments.push({ ...group, categoryId: planned.get(categoryId)._id })
      continue
    }

    const key = categoryKey(group.owner, group.name)
    let categoryId = plannedKeys.get(key)
    if (!categoryId) {
      const candidates = existingCategories.filter((item) => (
        item.name === group.name &&
        item.system !== true &&
        !assignedExistingIds.has(idString(item._id)) &&
        (!item.owner || idString(item.owner) === idString(group.owner))
      ))
      const canonical = chooseCategory(candidates, group.owner)
      const id = canonical?._id || new mongoose.Types.ObjectId()
      categoryId = idString(id)
      planned.set(categoryId, {
        _id: id,
        name: group.name,
        owner: group.owner,
        system: false,
        description: canonical?.description || '',
        sortOrder: canonical?.sortOrder || 0
      })
      plannedKeys.set(key, categoryId)
      if (canonical) assignedExistingIds.add(idString(canonical._id))
    }
    mediaAssignments.push({ ...group, categoryId: planned.get(categoryId)._id })
  }

  for (const category of existingCategories) {
    const existingId = idString(category._id)
    if (assignedExistingIds.has(existingId) || systemByName.has(category.name)) continue

    const owner = category.owner || fallbackOwner?._id
    if (!owner) {
      throw new Error(`分类「${category.name}」没有资源引用，且数据库中没有可承接该分类的管理员账号`)
    }
    const name = normalizedName(category.name)
    const key = categoryKey(owner, name)
    if (plannedKeys.has(key)) continue

    planned.set(existingId, {
      _id: category._id,
      name,
      owner,
      system: false,
      description: category.description || '',
      sortOrder: category.sortOrder || 0
    })
    plannedKeys.set(key, existingId)
    assignedExistingIds.add(existingId)
  }

  const obsoleteIds = existingCategories
    .filter((item) => !planned.has(idString(item._id)))
    .map((item) => item._id)

  return {
    existingCategories,
    mediaGroups,
    mediaAssignments,
    planned: [...planned.values()],
    obsoleteIds
  }
}

async function listIndexes() {
  const collections = await mongoose.connection.db.listCollections({
    name: MediaCategory.collection.name
  }).toArray()
  if (collections.length === 0) return []
  return MediaCategory.collection.listIndexes().toArray()
}

function isLegacyNameIndex(index) {
  return index.unique === true && Object.keys(index.key || {}).length === 1 && index.key.name === 1
}

function isOwnershipIndex(index) {
  const keys = Object.entries(index.key || {})
  return index.unique === true && keys.length === 2 && keys[0][0] === 'owner' && keys[0][1] === 1 &&
    keys[1][0] === 'name' && keys[1][1] === 1
}

async function verifyMigration() {
  const systemNames = [...systemByName.keys()]
  const [missingCategoryId, danglingRows, mismatchedRows, ownershipRows, invalidSystem, invalidCustom, duplicates, indexes] = await Promise.all([
    Media.countDocuments({ categoryId: null }),
    Media.aggregate([
      { $lookup: { from: MediaCategory.collection.name, localField: 'categoryId', foreignField: '_id', as: 'categoryEntity' } },
      { $match: { categoryEntity: { $size: 0 } } },
      { $count: 'count' }
    ]),
    Media.aggregate([
      { $lookup: { from: MediaCategory.collection.name, localField: 'categoryId', foreignField: '_id', as: 'categoryEntity' } },
      { $unwind: '$categoryEntity' },
      { $match: { $expr: { $ne: ['$category', '$categoryEntity.name'] } } },
      { $count: 'count' }
    ]),
    Media.aggregate([
      { $lookup: { from: MediaCategory.collection.name, localField: 'categoryId', foreignField: '_id', as: 'categoryEntity' } },
      { $unwind: '$categoryEntity' },
      {
        $match: {
          'categoryEntity.system': { $ne: true },
          $expr: { $ne: ['$uploader', '$categoryEntity.owner'] }
        }
      },
      { $count: 'count' }
    ]),
    MediaCategory.countDocuments({
      $or: [
        { name: { $in: systemNames }, $or: [{ system: { $ne: true } }, { owner: { $ne: null } }] },
        { system: true, name: { $nin: systemNames } }
      ]
    }),
    MediaCategory.countDocuments({ system: { $ne: true }, owner: null }),
    MediaCategory.aggregate([
      { $group: { _id: { owner: '$owner', name: '$name' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'count' }
    ]),
    listIndexes()
  ])
  const checks = {
    missingCategoryId,
    danglingReferences: danglingRows[0]?.count || 0,
    mismatchedCategoryNames: mismatchedRows[0]?.count || 0,
    crossOwnerCategoryReferences: ownershipRows[0]?.count || 0,
    invalidSystemCategories: invalidSystem,
    invalidCustomCategories: invalidCustom,
    duplicateOwnerNames: duplicates[0]?.count || 0,
    legacyNameIndex: indexes.some(isLegacyNameIndex),
    ownershipIndex: indexes.some(isOwnershipIndex)
  }
  console.log('校验结果：', JSON.stringify(checks, null, 2))

  if (Object.entries(checks).some(([key, value]) => key === 'ownershipIndex' ? value !== true : Boolean(value))) {
    throw new Error('媒体分类归属迁移校验未通过')
  }
}

async function applyMigration(plan) {
  const indexes = await listIndexes()
  for (const index of indexes.filter(isLegacyNameIndex)) {
    await MediaCategory.collection.dropIndex(index.name)
    console.log(`已删除旧全局唯一索引：${index.name}`)
  }

  if (plan.planned.length > 0) {
    await MediaCategory.collection.bulkWrite(plan.planned.map((category) => ({
      updateOne: {
        filter: { _id: category._id },
        update: {
          $set: {
            name: category.name,
            owner: category.owner,
            system: category.system,
            description: category.description,
            sortOrder: category.sortOrder,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    })), { ordered: true })
  }

  for (const assignment of plan.mediaAssignments) {
    await Media.updateMany({
      uploader: assignment.owner,
      category: assignment.rawName == null ? null : assignment.rawName
    }, {
      $set: { category: assignment.name, categoryId: assignment.categoryId }
    })
  }

  if (plan.obsoleteIds.length > 0) {
    await MediaCategory.deleteMany({ _id: { $in: plan.obsoleteIds } })
  }

  const refreshedIndexes = await listIndexes()
  const ownershipIndex = refreshedIndexes.find((item) => item.name === 'owner_1_name_1')
  if (ownershipIndex && !isOwnershipIndex(ownershipIndex)) {
    await MediaCategory.collection.dropIndex(ownershipIndex.name)
  }
  await MediaCategory.collection.createIndex({ owner: 1, name: 1 }, {
    unique: true,
    name: 'owner_1_name_1'
  })
  await MediaCategory.collection.createIndex({ system: 1, sortOrder: 1, createdAt: 1 }, {
    name: 'system_1_sortOrder_1_createdAt_1'
  })
}

async function main() {
  await mongoose.connect(env.mongodbUri, { autoIndex: false })
  try {
    console.log(`模式：${apply ? 'apply' : verifyOnly ? 'verify' : 'dry-run'}`)
    if (verifyOnly) {
      await verifyMigration()
      return
    }

    const plan = await buildMigrationPlan()
    console.log(JSON.stringify({
      currentCategories: plan.existingCategories.length,
      plannedCategories: plan.planned.length,
      obsoleteCategories: plan.obsoleteIds.length,
      mediaOwnerCategoryGroups: plan.mediaGroups.length,
      mediaRecords: plan.mediaGroups.reduce((sum, item) => sum + item.count, 0)
    }, null, 2))

    if (!apply) {
      console.log('当前为 dry-run，传入 --apply 后才会写入数据库。')
      return
    }

    await applyMigration(plan)
    await verifyMigration()
    console.log('媒体分类归属迁移完成。')
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error('媒体分类归属迁移失败：', error)
  process.exitCode = 1
})
