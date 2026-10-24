import fs from 'node:fs/promises'
import path from 'node:path'
import { resolveUploadRoot } from '#utils/uploadPath.js'

const CACHE_TTL_MS = 60_000
const FILE_STAT_BATCH_SIZE = 128
let cachedUsage = null
let pendingScan = null
let storageVersion = 0

async function measureDirectory(rootPath, label) {
  const result = { label, path: rootPath, exists: false, status: 'missing', bytes: 0, fileCount: 0 }
  let rootStats
  try {
    rootStats = await fs.stat(rootPath)
  } catch (error) {
    if (error.code === 'ENOENT') return result
    return { ...result, status: 'unavailable' }
  }

  if (!rootStats.isDirectory()) return { ...result, status: 'unavailable' }
  result.exists = true
  result.status = 'available'
  const directories = [rootPath]

  try {
    while (directories.length > 0) {
      const currentPath = directories.pop()
      const entries = await fs.readdir(currentPath, { withFileTypes: true })
      const files = []
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name)
        if (entry.isDirectory()) directories.push(entryPath)
        else if (entry.isFile()) files.push(entryPath)
      }

      for (let index = 0; index < files.length; index += FILE_STAT_BATCH_SIZE) {
        const stats = await Promise.all(files.slice(index, index + FILE_STAT_BATCH_SIZE).map((filePath) => fs.stat(filePath)))
        stats.forEach((fileStats) => {
          if (!fileStats.isFile()) return
          result.bytes += fileStats.size
          result.fileCount += 1
        })
      }
    }
  } catch {
    return { ...result, status: 'unavailable', bytes: 0, fileCount: 0 }
  }

  return result
}

async function scanMediaStorage() {
  const uploadRoot = resolveUploadRoot()
  const parent = path.dirname(uploadRoot)
  const areas = await Promise.all([
    measureDirectory(uploadRoot, '公开上传目录'),
    measureDirectory(path.join(parent, 'uploads-private'), '密码箱及私有资源'),
    measureDirectory(path.join(parent, '.media-tmp'), '临时上传文件')
  ])
  const unavailable = areas.some((area) => area.status === 'unavailable')
  return {
    totalBytes: areas.reduce((sum, area) => sum + area.bytes, 0),
    fileCount: areas.reduce((sum, area) => sum + area.fileCount, 0),
    status: unavailable ? 'partial' : 'available',
    areas: areas.map(({ path: _path, ...area }) => area),
    scannedAt: new Date().toISOString()
  }
}

/**
 * 汇总公开、私有及临时上传目录的磁盘占用，并在短时间内复用扫描结果。
 * @param {{refresh?: boolean}} options refresh 为 true 时绕过现有缓存重新扫描；已有扫描则复用其结果。
 * @returns {Promise<{totalBytes: number, fileCount: number, status: string, areas: Array, scannedAt: string}>} 各目录占用和扫描时间。
 * @throws {Error} 目录状态会以 area.status 表达；无法访问单个目录时返回 partial，不中断其余目录统计。
 */
export async function getMediaStorageUsage({ refresh = false } = {}) {
  if (!refresh && cachedUsage && Date.now() - cachedUsage.scannedAtMs < CACHE_TTL_MS) {
    return cachedUsage.value
  }
  if (pendingScan?.version === storageVersion) return pendingScan.promise

  const version = storageVersion
  const promise = scanMediaStorage()
    .then((value) => {
      if (version === storageVersion) cachedUsage = { value, scannedAtMs: Date.now() }
      return value
    })
    .finally(() => {
      if (pendingScan?.promise === promise) pendingScan = null
    })
  pendingScan = { version, promise }
  return promise
}

export function invalidateMediaStorageUsageCache() {
  storageVersion += 1
  cachedUsage = null
}
