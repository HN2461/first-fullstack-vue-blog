import fs from 'node:fs/promises'
import path from 'node:path'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { resolvePrivateWorkJournalRoot } from '#modules/workJournal/utils/workEvidenceStorage.js'
import { resourceError } from '../constants/resourceScenes.js'
import { getBusinessDate } from '#utils/businessDate.js'

/**
 * 返回永久和临时存储的统一清单，供读写、统计与运维核对。
 * @returns {Array<{key: string, path: string, label: string, temporary?: boolean}>} 存储区域。
 * @throws {Error} 上传根目录配置无效时抛出。
 */
export function getResourceStorageAreas() {
  const uploadRoot = resolveUploadRoot()
  return [
    { key: 'public', path: uploadRoot, label: '公开上传目录' },
    { key: 'private', path: path.resolve(uploadRoot, '..', 'uploads-private'), label: '密码箱及私有资源' },
    { key: 'legacy-work-journal', path: resolvePrivateWorkJournalRoot(), label: '历史工作日志凭证' },
    { key: 'temporary', path: path.resolve(uploadRoot, '..', '.media-tmp'), label: '临时上传文件', temporary: true }
  ]
}

function isInside(root, target) {
  const relative = path.relative(root, target)
  return Boolean(relative) && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)
}

/**
 * 把受管文件路径转换为可迁移的存储键，不接受根目录和越界路径。
 * @param {string} filePath 服务端生成的文件路径。
 * @returns {{provider: string, storageKey: string}} 本地提供方及区域相对键。
 * @throws {Error} 文件不属于已登记存储区域时返回 409。
 */
export function describeResourcePath(filePath) {
  const target = path.resolve(filePath)
  const area = getResourceStorageAreas().find((entry) => !entry.temporary && isInside(entry.path, target))
  if (!area) throw resourceError(409, 'RESOURCE_PATH_INVALID', '文件不在受管存储目录内')
  return { provider: 'local', storageKey: `${area.key}/${path.relative(area.path, target).replaceAll('\\', '/')}` }
}

/**
 * 解析服务端文件记录并核验真实路径，防止目录穿越和符号链接逃逸。
 * @param {object} media 含 storageKey 或历史 storagePath 的服务端记录。
 * @param {{allowMissing?: boolean}} options 允许缺失用于幂等清理。
 * @returns {Promise<string|null>} 已验证的绝对路径，允许缺失时返回 null。
 * @throws {Error} 非本地提供方、越界、目录或缺失文件时拒绝。
 */
export async function resolveResourcePath(media, { allowMissing = false } = {}) {
  if (media.provider && media.provider !== 'local') throw resourceError(409, 'RESOURCE_PROVIDER_INVALID', '文件存储提供方不可用')
  const areas = getResourceStorageAreas().filter((area) => !area.temporary)
  let target
  if (media.storageKey) {
    const slash = media.storageKey.indexOf('/')
    const area = areas.find((entry) => entry.key === media.storageKey.slice(0, slash))
    if (!area) throw resourceError(409, 'RESOURCE_PATH_INVALID', '文件存储键无效')
    target = path.resolve(area.path, media.storageKey.slice(slash + 1))
    if (!isInside(area.path, target)) throw resourceError(409, 'RESOURCE_PATH_INVALID', '文件存储键越界')
  } else {
    target = path.resolve(media.storagePath || '')
  }
  const area = areas.find((entry) => isInside(entry.path, target))
  if (!area) throw resourceError(409, 'RESOURCE_PATH_INVALID', '文件不在受管存储目录内')
  try {
    const [root, realTarget] = await Promise.all([fs.realpath(area.path), fs.realpath(target)])
    if (!isInside(root, realTarget) || !(await fs.stat(realTarget)).isFile()) {
      throw resourceError(409, 'RESOURCE_PATH_INVALID', '文件真实路径不在受管目录内')
    }
    return realTarget
  } catch (error) {
    if (allowMissing && error.code === 'ENOENT') return null
    if (error.code === 'ENOENT') throw resourceError(404, 'RESOURCE_FILE_MISSING', '文件不存在')
    throw error
  }
}

/**
 * 将已校验的文件写入指定存储区域，私有文件物理隔离。
 * @param {Buffer|string} source 文件内容或服务端临时文件路径。
 * @param {{accessScope: string, scene: string, filename: string}} options 服务端策略和生成的文件名。
 * @returns {Promise<object>} 存储描述及绝对路径。
 * @throws {Error} 文件名非法、越界或磁盘写入失败时抛出。
 */
export async function writeResourceFile(source, { accessScope, scene, filename }) {
  if (!/^[a-z0-9-]+$/.test(scene) || path.basename(filename) !== filename) {
    throw resourceError(400, 'RESOURCE_PATH_INVALID', '文件保存参数无效')
  }
  const area = getResourceStorageAreas().find((entry) => entry.key === (accessScope === 'public' ? 'public' : 'private'))
  const month = getBusinessDate().slice(0, 7).replace('-', '/')
  const target = path.join(area.path, accessScope === 'vault' ? 'vault' : 'resources', scene, month, filename)
  await fs.mkdir(path.dirname(target), { recursive: true })
  // wx/COPYFILE_EXCL 防止覆盖既有对象；原始临时文件由调用方回收。
  if (Buffer.isBuffer(source)) await fs.writeFile(target, source, { flag: 'wx', mode: 0o600 })
  else {
    await fs.copyFile(source, target, 1)
    try {
      await fs.chmod(target, 0o600)
    } catch (error) {
      await fs.unlink(target).catch(() => {})
      throw error
    }
  }
  return { ...describeResourcePath(target), storagePath: target, filename }
}

/**
 * 删除经过服务端记录和真实目录校验的文件；不允许客户端直接提供路径。
 * @param {object} media 服务端资源记录。
 * @returns {Promise<boolean>} 实际删除返回 true，原文件已不存在返回 false。
 * @throws {Error} 路径不可信或删除失败时抛出。
 */
export async function removeResourceFile(media) {
  const filePath = await resolveResourcePath(media, { allowMissing: true })
  if (!filePath) return false
  await fs.unlink(filePath)
  return true
}
