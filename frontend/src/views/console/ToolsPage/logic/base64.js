export const MAX_BASE64_BYTES = 2 * 1024 * 1024
// 原文可能带 MIME 换行；先限制接收量，解码容量在去除空白后按真实字节判断。
const MAX_ENCODED_LENGTH = 4 * 1024 * 1024
const HEX_PREVIEW_BYTES = 65536

function assertBytes(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('文件内容必须是字节数组')
  if (bytes.byteLength > MAX_BASE64_BYTES) throw new Error('每次最多处理 2 MiB 数据，请拆分后处理')
}

function utf8Bytes(text) {
  if (typeof text !== 'string') throw new Error('输入必须是文本')
  if (text.length > MAX_BASE64_BYTES) throw new Error('文本过长，每次最多处理 2 MiB UTF-8 数据')
  // TextEncoder 会把孤立代理项悄悄替换为 U+FFFD，这里先拒绝以保证转换可逆。
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = text.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error(`第 ${index + 1} 个位置存在不完整的 Unicode 字符`)
      index += 1
    } else if (unit >= 0xdc00 && unit <= 0xdfff) throw new Error(`第 ${index + 1} 个位置存在不完整的 Unicode 字符`)
  }
  const bytes = new TextEncoder().encode(text)
  assertBytes(bytes)
  return bytes
}

/**
 * 按 RFC 4648 将字节编码为 Base64 或 Base64url。
 * @param {Uint8Array} bytes 原始数据，最多 2 MiB。
 * @param {object} options urlSafe 选择 URL 字母表，padding 决定是否保留 =。
 * @returns {string} 编码文本；无效类型和超限输入抛错，空字节返回空文本。
 */
export function encodeBase64Bytes(bytes, { urlSafe = false, padding = true } = {}) {
  assertBytes(bytes)
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768))
  let result = btoa(binary)
  if (urlSafe) result = result.replace(/\+/g, '-').replace(/\//g, '_')
  return padding ? result : result.replace(/=+$/u, '')
}

/**
 * 校验字母表、填充位置与末尾位并解码，避免宽松 atob 接受损坏数据。
 * @param {string} input Base64、Base64url 或 base64 Data URL。
 * @param {object} options alphabet 可为 auto/standard/url，ignoreWhitespace 仅忽略 ASCII 空白。
 * @returns {{bytes: Uint8Array, mimeType: string}} 完整原始字节及 Data URL 的媒体类型。
 * 无效字符、混合字母表、非法填充、非零填充位和超限输入抛错；允许缺省末尾填充。
 */
export function decodeBase64Bytes(input, { alphabet = 'auto', ignoreWhitespace = true } = {}) {
  if (typeof input !== 'string') throw new Error('输入必须是 Base64 文本')
  if (input.length > MAX_ENCODED_LENGTH) throw new Error('Base64 内容过长，每次最多解码 2 MiB 数据')
  if (!['auto', 'standard', 'url'].includes(alphabet)) throw new Error('不支持的 Base64 字母表')
  let encoded = input
  let mimeType = 'application/octet-stream'
  let dataUrl = false
  if (/^data:/iu.test(encoded)) {
    const match = encoded.match(/^data:([^,]*),([\s\S]*)$/iu)
    if (!match || match[1].length > 4096 || !/;base64$/iu.test(match[1])) throw new Error('Data URL 元数据必须以 ;base64 结尾')
    const metadata = match[1].split(';')
    const type = metadata.shift()
    metadata.pop()
    if (metadata.some((parameter) => !/^[^=;\s]+=[^;\s]+$/u.test(parameter))) throw new Error('Data URL 参数必须使用名称=值的形式')
    if (type && !/^[\w!#$&^.+-]+\/[\w!#$&^.+-]+$/u.test(type)) throw new Error('Data URL 的媒体类型无效')
    mimeType = type || 'text/plain'
    encoded = match[2]
    dataUrl = true
  }
  if (ignoreWhitespace) encoded = encoded.replace(/[\t\n\f\r ]/g, '')
  if (dataUrl && (/[-_]/u.test(encoded) || alphabet === 'url')) throw new Error('Base64 Data URL 必须使用标准字母表，请选择标准或自动识别')
  if ((/[+/]/u.test(encoded) && /[-_]/u.test(encoded)) || (alphabet === 'standard' && /[-_]/u.test(encoded)) || (alphabet === 'url' && /[+/]/u.test(encoded))) throw new Error('Base64 字母表不匹配，请检查标准与 URL-safe 模式')
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
  if (!/^[A-Za-z0-9+/]*={0,2}$/u.test(normalized)) throw new Error('含非法 Base64 字符或填充位置不正确')
  const body = normalized.replace(/=+$/u, '')
  if (body.length % 4 === 1 || (normalized.includes('=') && normalized.length % 4 !== 0)) throw new Error('Base64 长度或末尾填充不正确')
  const padded = body + '='.repeat((4 - body.length % 4) % 4)
  if (normalized.includes('=') && normalized !== padded) throw new Error('Base64 末尾填充数量不正确')
  if (Math.floor(body.length * 3 / 4) > MAX_BASE64_BYTES) throw new Error('解码数据超过 2 MiB')
  let binary
  try { binary = atob(padded) } catch { throw new Error('Base64 内容无效') }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  if (encodeBase64Bytes(bytes) !== padded) throw new Error('Base64 末尾填充位无效，内容可能已损坏')
  return { bytes, mimeType }
}

/**
 * 编解码 UTF-8 文本或本地文件字节，二进制结果提供十六进制预览与完整下载数据。
 * @param {object} options operation、input/bytes、字母表、填充、Data URL 与输出格式。
 * @returns {object} 输出文本、完整解码字节、媒体类型、统计与是否截断预览。
 * 显式 text 模式拒绝非 UTF-8 数据；auto 模式按字节展示，不用替换字符伪装成功。
 */
export function processBase64({ input = '', operation = 'encode', alphabet = 'standard', padding = true, ignoreWhitespace = true, asDataUrl = false, outputFormat = 'auto', bytes, mimeType = 'text/plain' }) {
  if (operation === 'encode') {
    if (!['standard', 'url', 'auto'].includes(alphabet)) throw new Error('不支持的 Base64 字母表')
    const source = bytes == null ? utf8Bytes(input) : bytes
    assertBytes(source)
    if (asDataUrl && !/^[\w!#$&^.+-]+\/[\w!#$&^.+-]+$/u.test(mimeType)) throw new Error('媒体类型格式不正确')
    if (asDataUrl && alphabet === 'url') throw new Error('Data URL 使用标准 Base64 字母表，请切换为标准模式')
    const encoded = encodeBase64Bytes(source, { urlSafe: alphabet === 'url', padding: asDataUrl || padding })
    return { output: asDataUrl ? `data:${mimeType};base64,${encoded}` : encoded, bytes: null, binary: false, truncated: false, message: `${source.length.toLocaleString()} 字节 → ${encoded.length.toLocaleString()} 个 Base64 字符` }
  }
  if (operation !== 'decode') throw new Error('不支持的 Base64 操作')
  if (!['auto', 'text', 'hex'].includes(outputFormat)) throw new Error('不支持的解码结果格式')
  const decoded = decodeBase64Bytes(input, { alphabet, ignoreWhitespace })
  let text = ''
  let validText = true
  try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(decoded.bytes) } catch { validText = false }
  if (outputFormat === 'text' && !validText) throw new Error('解码内容是二进制或非 UTF-8，请选择自动识别或十六进制预览后下载原件')
  const hex = outputFormat === 'hex' || !validText
  const truncated = hex && decoded.bytes.length > HEX_PREVIEW_BYTES
  const output = hex ? Array.from(decoded.bytes.subarray(0, HEX_PREVIEW_BYTES), (byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ') : text
  return { ...decoded, output, binary: !validText, truncated, message: `已解码 ${decoded.bytes.length.toLocaleString()} 字节${hex ? '，十六进制预览' : '，UTF-8 文本'}${truncated ? '（仅预览前 64 KiB，可下载完整原件）' : ''}` }
}
