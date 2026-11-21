const MAX_TEXT_LENGTH = 1024 * 1024
const MAX_PARAMETERS = 10000

function boundedText(input) {
  const text = String(input)
  if (text.length > MAX_TEXT_LENGTH) throw new Error('查询参数最多支持 1 Mi 字符，请拆分后处理')
  return text
}

function queryPart(input) {
  const original = boundedText(input)
  const address = original.trim()
  if (!address) throw new Error('请输入 URL 或查询串')
  const firstQuestion = address.indexOf('?')
  const firstEquals = address.indexOf('=')
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(address)
  if (address.startsWith('//') || (hasScheme && (address.includes('://') || firstEquals < 0 || (firstQuestion >= 0 && firstQuestion < firstEquals)))) {
    try {
      return new URL(address, 'https://query.invalid').search.slice(1)
    } catch {
      throw new Error('URL 格式无效，请检查协议和地址')
    }
  }
  // 原始查询串首尾空格属于参数内容；只有 URL 地址按浏览器规则修剪，避免悄悄损坏值。
  const beforeFragment = original.split('#')[0]
  if (beforeFragment.startsWith('?')) return beforeFragment.slice(1)
  if (/^(?:\/|\.\.?\/)/.test(beforeFragment)) return new URL(beforeFragment, 'https://query.invalid').search.slice(1)
  const question = beforeFragment.indexOf('?')
  const equals = beforeFragment.indexOf('=')
  return question >= 0 && (equals < 0 || question < equals) ? beforeFragment.slice(question + 1) : beforeFragment
}

/**
 * 解析完整 URL、相对 URL 或查询串，显式保留重复参数、顺序、空值及解码后的换行。
 * @param {string} input URL/查询串；# 之后为片段，参数中原始 # 应写作 %23。
 * @returns {{ key: string, value: string }[]} 有序参数列表；URL 没有查询部分时返回空列表。
 * @throws {Error} 超过 1 Mi 字符/10000 个参数、空输入、无效 URL 或编码时抛出中文错误。
 */
export function parseQuery(input) {
  const query = queryPart(input)
  let parameters = 0
  let hasValue = false
  for (let index = 0; index <= query.length; index += 1) {
    if (index < query.length && query[index] !== '&') hasValue = true
    else if (hasValue) {
      if (++parameters > MAX_PARAMETERS) throw new Error('每次最多处理 10000 个查询参数，请拆分后处理')
      hasValue = false
    }
  }
  try {
    decodeURIComponent(query.replace(/\+/g, ' '))
  } catch {
    throw new Error('查询串包含无效的百分号转义或 UTF-8 编码')
  }
  const entries = []
  for (const [key, value] of new URLSearchParams(query)) {
    if (entries.length >= MAX_PARAMETERS) throw new Error('每次最多处理 10000 个查询参数，请拆分后处理')
    entries.push({ key, value })
  }
  return entries
}

/**
 * 从每行一个 key=value 生成查询串；只在第一个等号处分割，保留重复键与值两端空格。
 * @param {string} input 原始键值文本，空行跳过；空键可写为 =value，空值可写为 key=。
 * @returns {string} application/x-www-form-urlencoded 查询串，不包含开头的问号。
 * @throws {Error} 超过 1 Mi 字符/10000 个参数、空输入或非空行没有等号时抛出错误。
 */
export function generateQuery(input) {
  const text = boundedText(input)
  if (!text.trim()) throw new Error('请输入每行一个 key=value 的参数')
  const params = new URLSearchParams()
  let count = 0
  text.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return
    if (++count > MAX_PARAMETERS) throw new Error('每次最多处理 10000 个查询参数，请拆分后处理')
    const equals = line.indexOf('=')
    if (equals < 0) throw new Error(`第 ${index + 1} 行缺少等号，请使用 key=value 格式`)
    try {
      encodeURIComponent(line)
    } catch {
      throw new Error(`第 ${index + 1} 行包含无效的 Unicode 字符`)
    }
    params.append(line.slice(0, equals), line.slice(equals + 1))
  })
  return params.toString()
}
