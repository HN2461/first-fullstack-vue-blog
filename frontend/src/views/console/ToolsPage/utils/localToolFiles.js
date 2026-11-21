export const LOCAL_FILE_LIMIT = 2 * 1024 * 1024

/**
 * 有界读取用户主动选择的本地文件，仅在内存使用，不上传或登记长期资源。
 * @param {File} file 用户选择的文件。
 * @param {number} limit 字节上限，默认 2 MiB，显式配置最多 4 MiB。
 * @returns {Promise<Uint8Array>} 原始字节；不可读取、空文件参数或超限时抛错。
 */
export async function readLocalToolBytes(file, limit = LOCAL_FILE_LIMIT) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new Error('请选择本地文件')
  if (!Number.isInteger(limit) || limit <= 0 || limit > 4 * 1024 * 1024) throw new Error('本地文件大小限制无效')
  if (file.size > limit) throw new Error(`每次最多导入 ${limit / 1024 / 1024} MiB 文件`)
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes.byteLength > limit) throw new Error(`文件超过 ${limit / 1024 / 1024} MiB`)
  return bytes
}

/**
 * 读取 UTF-8 文本文件，拒绝无效编码，允许文件头存在 UTF-8 BOM。
 * @param {File} file 本地文本文件。
 * @param {number} limit 字节上限，默认 2 MiB，显式配置最多 4 MiB。
 * @returns {Promise<string>} 无文件头 BOM 的文本；非 UTF-8 内容抛出说明性错误。
 */
export async function readLocalToolText(file, limit = LOCAL_FILE_LIMIT) {
  const bytes = await readLocalToolBytes(file, limit)
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch { throw new Error('文件不是有效 UTF-8 文本，请转换编码后重试') }
}

/**
 * 将用户主动导出的结果交给浏览器下载，并及时释放临时 Object URL。
 * @param {string|Uint8Array} data 完整结果文本或字节。
 * @param {string} filename 建议文件名，路径与控制字符会被移除。
 * @param {string} mimeType 下载类型，二进制默认 octet-stream。
 * @returns {void} 浏览器接管下载；不写服务器磁盘或上传资源目录。
 */
export function downloadToolResult(data, filename, mimeType = 'application/octet-stream') {
  const safeName = String(filename || 'result.bin').replace(/[\\/\x00-\x1f<>:"|?*]/g, '_').slice(0, 180)
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = safeName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
