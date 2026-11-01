import fs from 'node:fs/promises'
import { env } from '#config/env'

const RELEASE_TARGETS = new Set(['full', 'backend', 'frontend'])

function emptyReleaseInfo() {
  return {
    lastSuccessfulReleaseAt: null,
    target: null,
    releaseId: null
  }
}

export function normalizeReleaseInfo(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return emptyReleaseInfo()
  }

  if (typeof payload.lastSuccessfulReleaseAt !== 'string' || !payload.lastSuccessfulReleaseAt.trim()) {
    return emptyReleaseInfo()
  }

  const releaseDate = new Date(payload.lastSuccessfulReleaseAt)
  const target = String(payload.target || '')
  const releaseId = String(payload.releaseId || '').trim()

  if (!Number.isFinite(releaseDate.getTime()) || !RELEASE_TARGETS.has(target) || !releaseId) {
    return emptyReleaseInfo()
  }

  return {
    lastSuccessfulReleaseAt: releaseDate.toISOString(),
    target,
    releaseId: releaseId.slice(0, 128)
  }
}

/**
 * 读取最近一次成功发布信息。
 * @param {string} filePath 发布元数据 JSON 文件路径，默认读取部署运行目录。
 * @returns {Promise<{lastSuccessfulReleaseAt: string|null, target: string|null, releaseId: string|null}>} 缺失或无效时返回三个 null 字段。
 */
export async function getReleaseInfo(filePath = env.releaseMetaFile) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return normalizeReleaseInfo(JSON.parse(content))
  } catch {
    // 首次部署前可能还没有发布记录，不能因此影响工作台读取。
    return emptyReleaseInfo()
  }
}
