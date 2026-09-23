import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { env } from '#config/env'
import { Media } from '#modules/media/models/Media.js'
import { assertMediaCategoryExists, ensureDefaultMediaCategory } from '#modules/media/services/mediaCategory.service.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { resolvePrivateWorkJournalPath } from '#modules/workJournal/utils/workEvidenceStorage.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'

const applyChanges = process.argv.includes('--apply')
const MEDIA_EXTENSIONS = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
})

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function checksum(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex')
}

async function collectLegacyEvidence() {
  const logs = await WorkLog.find({ 'evidence.0': { $exists: true } })
  const legacy = []
  const issues = []
  let totalBytes = 0

  for (const log of logs) {
    for (const evidence of log.evidence) {
      if (evidence.mediaId) continue
      if (!evidence.storedName) {
        issues.push({ logId: log._id.toString(), evidenceId: evidence._id.toString(), reason: '没有旧文件名或媒体关联' })
        continue
      }

      let sourcePath
      try {
        sourcePath = resolvePrivateWorkJournalPath(evidence.storedName)
      } catch (error) {
        issues.push({ logId: log._id.toString(), evidenceId: evidence._id.toString(), reason: error.message })
        continue
      }

      const contents = await fs.readFile(sourcePath).catch(() => null)
      if (!contents) {
        issues.push({ logId: log._id.toString(), evidenceId: evidence._id.toString(), reason: '旧凭证文件不存在' })
        continue
      }
      if (checksum(contents) !== evidence.sha256) {
        issues.push({ logId: log._id.toString(), evidenceId: evidence._id.toString(), reason: 'SHA-256 校验失败' })
        continue
      }

      totalBytes += contents.length
      legacy.push({ log, evidence, sourcePath, contents })
    }
  }

  return { legacy, issues, totalBytes }
}

async function migrateEvidence(item, category) {
  const existing = await Media.findOne({
    workJournalLog: item.log._id,
    workJournalEvidence: item.evidence._id
  })

  if (existing) {
    item.evidence.mediaId = existing._id
    item.evidence.storedName = ''
    await item.log.save()
    await fs.unlink(item.sourcePath).catch(() => {})
    return 'linked'
  }

  const extension = MEDIA_EXTENSIONS[item.evidence.mimeType]
  if (!extension) throw new Error(`不支持的凭证格式：${item.evidence.mimeType}`)

  const uploadDate = item.evidence.uploadedAt || item.log.createdAt || new Date()
  const directory = path.join(
    resolveUploadRoot(),
    'work-journal',
    String(uploadDate.getFullYear()),
    String(uploadDate.getMonth() + 1).padStart(2, '0')
  )
  await fs.mkdir(directory, { recursive: true })
  const filename = `${crypto.randomUUID()}${extension}`
  const storagePath = path.join(directory, filename)
  const mediaId = new mongoose.Types.ObjectId()
  const media = new Media({
    _id: mediaId,
    filename,
    originalName: item.evidence.originalName,
    mimeType: item.evidence.mimeType,
    size: item.contents.length,
    url: `/api/work-journal/media-content/${mediaId}`,
    storagePath: storagePath.replace(/\\/g, '/'),
    kind: 'image',
    category: category.name,
    categoryId: category._id,
    fileClass: 'image',
    accessScope: 'private',
    sha256: item.evidence.sha256,
    workJournalLog: item.log._id,
    workJournalEvidence: item.evidence._id,
    uploader: item.log.createdBy
  })

  await fs.writeFile(storagePath, item.contents, { flag: 'wx', mode: 0o600 })
  try {
    await media.save()
    item.evidence.mediaId = media._id
    item.evidence.storedName = ''
    await item.log.save()
  } catch (error) {
    await Media.deleteOne({ _id: media._id }).catch(() => {})
    await fs.unlink(storagePath).catch(() => {})
    throw error
  }

  await fs.unlink(item.sourcePath)
  return 'migrated'
}

async function main() {
  await mongoose.connect(env.mongodbUri, { autoIndex: false })
  const { legacy, issues, totalBytes } = await collectLegacyEvidence()
  console.log(applyChanges ? '迁移旧工作日记凭证至媒体资产' : '工作日记凭证迁移 dry-run')
  console.log(`待迁移图片：${legacy.length} 张；磁盘占用：${formatBytes(totalBytes)}；阻断问题：${issues.length} 项`)
  issues.forEach((item) => console.log(`  [BLOCK] 日记 ${item.logId} 凭证 ${item.evidenceId}：${item.reason}`))

  if (!applyChanges) {
    console.log('只读检查完成；完成数据库与旧凭证目录备份后，使用 --apply 执行迁移')
    return
  }
  if (issues.length) throw new Error(`存在 ${issues.length} 项无法验证的旧凭证，未执行迁移`)

  await ensureDefaultMediaCategory()
  const category = await assertMediaCategoryExists('工作日志', legacy[0]?.log.createdBy)
  let migrated = 0
  let linked = 0
  for (const item of legacy) {
    const result = await migrateEvidence(item, category)
    if (result === 'linked') linked += 1
    else migrated += 1
  }
  console.log(`迁移完成：新建媒体资源 ${migrated} 项；补齐已有媒体关联 ${linked} 项`)
}

main()
  .catch((error) => {
    console.error(`工作日记凭证迁移失败：${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  })
