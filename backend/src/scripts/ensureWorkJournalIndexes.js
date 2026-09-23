import mongoose from 'mongoose'
import { env } from '#config/env'
import { Employment } from '#modules/workJournal/models/Employment.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { WorkReport } from '#modules/workJournal/models/WorkReport.js'

const applyChanges = process.argv.includes('--apply')
const verifyOnly = process.argv.includes('--verify')

const INDEX_PLANS = [
  {
    model: Employment,
    collection: Employment.collection,
    indexes: [
      { key: { createdBy: 1 }, options: { name: 'createdBy_1' } },
      { key: { createdBy: 1, startedOn: -1 }, options: { name: 'createdBy_1_startedOn_-1' } }
    ]
  },
  {
    model: WorkLog,
    collection: WorkLog.collection,
    indexes: [
      { key: { employment: 1 }, options: { name: 'employment_1' } },
      { key: { status: 1 }, options: { name: 'status_1' } },
      { key: { createdBy: 1 }, options: { name: 'createdBy_1' } },
      { key: { deletedAt: 1 }, options: { name: 'deletedAt_1' } },
      {
        key: { createdBy: 1, employment: 1, workDate: 1 },
        options: { name: 'createdBy_1_employment_1_workDate_1', unique: true }
      },
      {
        key: { createdBy: 1, employment: 1, status: 1, workDate: -1 },
        options: { name: 'createdBy_1_employment_1_status_1_workDate_-1' }
      }
    ]
  },
  {
    model: WorkReport,
    collection: WorkReport.collection,
    indexes: [
      {
        key: { createdBy: 1, employment: 1, period: 1, fromDate: 1, toDate: 1 },
        options: { name: 'createdBy_1_employment_1_period_1_fromDate_1_toDate_1', unique: true }
      },
      {
        key: { createdBy: 1, period: 1, fromDate: -1 },
        options: { name: 'createdBy_1_period_1_fromDate_-1' }
      }
    ]
  }
]

function normalizeIndexKey(key) {
  return JSON.stringify(Object.entries(key))
}

function hasMatchingOptions(existing, expected) {
  return Boolean(existing.unique) === Boolean(expected.options.unique)
}

async function listExistingIndexes(collection) {
  const cursor = collection.conn.db.listCollections({ name: collection.collectionName }, { nameOnly: true })
  if (!await cursor.hasNext()) return []
  return collection.listIndexes().toArray()
}

async function inspectPlan(plan) {
  const [existing, documentCount] = await Promise.all([
    listExistingIndexes(plan.collection),
    plan.collection.estimatedDocumentCount().catch(() => 0)
  ])
  const missing = []
  const conflicts = []
  for (const expected of plan.indexes) {
    const matched = existing.find((item) => normalizeIndexKey(item.key) === normalizeIndexKey(expected.key))
    if (!matched) {
      missing.push(expected)
    } else if (!hasMatchingOptions(matched, expected)) {
      conflicts.push({ existing: matched, expected })
    }
  }

  if (conflicts.length) {
    const details = conflicts.map(({ existing: actual, expected }) => `${expected.options.name} 现有 unique:${Boolean(actual.unique)}，期望 unique:${Boolean(expected.options.unique)}`).join('；')
    const error = new Error(`集合 ${plan.collection.collectionName} 存在索引选项冲突：${details}`)
    error.code = 'WORK_JOURNAL_INDEX_OPTIONS_CONFLICT'
    throw error
  }

  if (plan.collection.collectionName === WorkLog.collection.collectionName && documentCount > 0) {
    const duplicateGroups = await plan.collection.aggregate([
      {
        $group: {
          _id: { createdBy: '$createdBy', employment: '$employment', workDate: '$workDate' },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $count: 'duplicateKeys' }
    ]).toArray()
    const duplicateCount = Number(duplicateGroups[0]?.duplicateKeys || 0)
    if (duplicateCount > 0) {
      const error = new Error(`工作日记存在 ${duplicateCount} 组重复的工作经历与日期，不能创建唯一索引`)
      error.code = 'WORK_LOG_DUPLICATE_DATE_KEYS'
      throw error
    }
  }

  return { model: plan.model, collection: plan.collection.collectionName, documentCount, existing, missing }
}

async function main() {
  await mongoose.connect(env.mongodbUri, { autoIndex: false })
  const reports = await Promise.all(INDEX_PLANS.map(inspectPlan))

  console.log(applyChanges ? '应用工作日记索引计划' : verifyOnly ? '校验工作日记索引' : '工作日记索引 dry-run')
  reports.forEach(({ collection, documentCount, existing, missing }) => {
    console.log(`集合：${collection}；现有文档：${documentCount}；现有索引：${existing.length}；待创建：${missing.length}`)
    missing.forEach((index) => console.log(`  [${applyChanges ? 'CREATE' : 'PLAN'}] ${index.options.name} ${normalizeIndexKey(index.key)}`))
    if (missing.length === 0) console.log('  索引已齐全')
  })

  const missingCount = reports.reduce((total, report) => total + report.missing.length, 0)
  if (verifyOnly && missingCount > 0) {
    throw new Error(`索引校验失败：仍缺少 ${missingCount} 项索引`)
  }

  if (applyChanges) {
    for (const { model, missing } of reports) {
      if (missing.length) await model.createIndexes()
    }
    console.log('工作日记索引已创建')
  } else if (verifyOnly) {
    console.log('工作日记索引校验通过')
  } else {
    console.log('只读检查完成；确认 MongoDB 备份后，使用 --apply 创建缺失索引')
  }
}

main()
  .catch((error) => {
    console.error(`工作日记索引检查失败：${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  })
