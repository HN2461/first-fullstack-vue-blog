import { Media } from '../models/Media.js'

/**
 * 统一站内文件地址的身份识别，兼容完整网址、查询参数和历史静态地址。
 * @param {string} value 页面保存的文件地址。
 * @returns {string} 受管地址的 pathname；外链其他路径、非法协议和空值返回空串。
 * @throws {Error} 解析失败作为非受管地址处理，不抛出异常。
 */
export function getResourcePath(value) {
  try {
    const url = new URL(String(value || ''), 'http://resource.invalid')
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    if (!url.pathname.startsWith('/uploads/') && !/^\/api\/resources\/[a-f\d]{24}\/content$/i.test(url.pathname)) return ''
    return decodeURI(url.pathname)
  } catch {
    return ''
  }
}

/**
 * 从统一访问地址取得稳定 ID，识别后仍须查询记录并检查业务授权。
 * @param {string} value 相对或完整访问网址。
 * @returns {string|null} 资源 ID；历史静态地址或非受管地址返回 null。
 * @throws {Error} 无外部操作，非法地址返回 null。
 */
export function getResourceId(value) {
  return /^\/api\/resources\/([a-f\d]{24})\/content$/i.exec(getResourcePath(value))?.[1] || null
}

/**
 * 保留新 ID 地址与旧静态地址之间的别名，迁移期间不能漏掉仍使用旧链接的业务。
 * @param {object} media 服务端资源记录。
 * @returns {Array<string>} 去重后的原始、规范和历史地址。
 * @throws {Error} 无外部操作。
 */
export function getResourceAliases(media) {
  const values = [media?.url, getResourcePath(media?.url)]
  if (String(media?.storageKey || '').startsWith('public/')) values.push(`/uploads/${media.storageKey.slice('public/'.length)}`)
  return [...new Set(values.filter(Boolean))]
}

/**
 * 通过 ID 或旧地址查文件记录，别名只决定文件身份，不能代替权限校验。
 * @param {string} value 页面保存的资源 URL。
 * @returns {Promise<object|null>} 服务端记录，未知地址返回 null。
 * @throws {Error} 数据库失败时抛出。
 */
export async function findResourceByUrl(value) {
  const id = getResourceId(value)
  if (id) return Media.findById(id)
  const pathname = getResourcePath(value)
  if (!pathname) return null
  const conditions = [{ url: { $in: [...new Set([value, pathname, encodeURI(pathname)])] } }]
  if (pathname.startsWith('/uploads/')) conditions.push({ storageKey: `public/${pathname.slice('/uploads/'.length)}` })
  return Media.findOne({ $or: conditions })
}
