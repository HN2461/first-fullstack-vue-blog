import Papa from 'papaparse'

const MAX_TEXT_LENGTH = 1024 * 1024
const MAX_RECORDS = 10000
const MAX_COLUMNS = 1000

function validateQuotePlacement(input, delimiter) {
  // Papa 允许未加引号字段中的孤立双引号；此处按 RFC 4180 拒绝它，避免悄悄接受格式错误。
  let quoted = false
  let fieldStart = true
  let justClosed = false
  let recordHasContent = false
  let columns = 1
  let records = 0
  const recordPresence = []
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (quoted) {
      if (char !== '"') continue
      if (input[index + 1] === '"') {
        index += 1
        continue
      }
      quoted = false
      justClosed = true
      continue
    }
    if (char === '\r' || char === '\n') {
      if (recordHasContent && ++records > MAX_RECORDS + 1) throw new Error('表格最多支持 10000 条数据记录，请拆分后处理')
      recordPresence.push(recordHasContent)
      recordHasContent = false
      columns = 1
      if (char === '\r' && input[index + 1] === '\n') index += 1
      fieldStart = true
      justClosed = false
    } else if (char === delimiter) {
      if (++columns > MAX_COLUMNS) throw new Error('表格最多支持 1000 列，请拆分后处理')
      recordHasContent = true
      fieldStart = true
      justClosed = false
    } else if (char === '"' && fieldStart) {
      recordHasContent = true
      quoted = true
      fieldStart = false
    } else {
      if (char === '"' || justClosed) throw new Error('双引号格式无效：含双引号的字段必须整体加引号，内部双引号需写成两个')
      recordHasContent = true
      fieldStart = false
    }
  }
  if (recordHasContent && ++records > MAX_RECORDS + 1) throw new Error('表格最多支持 10000 条数据记录，请拆分后处理')
  recordPresence.push(recordHasContent)
  return recordPresence
}

/**
 * 按 RFC 4180 引号规则读取 CSV/TSV，保留单元格空白、逗号、双引号和多行内容。
 * @param {string} input 含表头的 CSV 或 TSV 文本，仅自动识别逗号与 Tab。
 * @returns {string[][]} 完整二维单元格数组；真正空行跳过，带引号的空单元格保留。
 * @throws {Error} 空输入、超过 1 Mi 字符/10000 条数据/1000 列、引号错误或列数不一致时拒绝处理。
 */
export function parseDelimitedText(input) {
  const text = String(input)
  if (text.length > MAX_TEXT_LENGTH) throw new Error('表格文本最多支持 1 Mi 字符，请拆分后处理')
  if (!text.trim()) throw new Error('请输入包含表头的 CSV 或 TSV 文本')
  // 只读取表头推断分隔符，先检查记录/列预算，再让完整解析器分配二维结果。
  const probe = Papa.parse(text, { preview: 1, dynamicTyping: false, skipEmptyLines: true, delimitersToGuess: [',', '\t'] })
  const presence = validateQuotePlacement(text.replace(/^\uFEFF/, ''), probe.meta.delimiter)
  const parsed = Papa.parse(text, { delimiter: probe.meta.delimiter, dynamicTyping: false, skipEmptyLines: false })
  const problem = parsed.errors.find((error) => error.code !== 'UndetectableDelimiter')
  if (problem) throw new Error(`表格第 ${(problem.row ?? 0) + 1} 行引号格式有误，请检查闭合和双引号转义`)
  // skipEmptyLines 会把单列的 "" 也丢弃；只过滤源文本中的真正空记录，保留显式空值。
  const rows = parsed.data.filter((_, index) => presence[index])
  if (!rows.length) throw new Error('没有可读取的表格内容')
  const width = rows[0].length
  rows.forEach((row, index) => {
    if (row.length !== width) throw new Error(`第 ${index + 1} 条记录有 ${row.length} 列，表头为 ${width} 列`)
  })
  return rows
}

function safeNumber(value) {
  // 身份编码、前导零与超出安全精度的值保留字符串，不能因“识别数字”破坏原值。
  if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value) || value === '-0') return value
  const number = Number(value)
  if (!Number.isFinite(number) || (Number.isInteger(number) && !Number.isSafeInteger(number))) return value
  const mantissa = value.split(/[eE]/)[0]
  if (Object.is(number, -0) || (number === 0 && /[1-9]/.test(mantissa))) return value
  if ((mantissa.includes('.') || /e/i.test(value)) && mantissa.replace(/[^\d]/g, '').replace(/^0+/, '').length > 15) return value
  return number
}

/**
 * 将首行为字段名的 CSV/TSV 转为对象列表；字段名修剪两端空白，值默认保持原文。
 * @param {string} input 表格文本。
 * @param {boolean} parseNumbers 是否显式转换安全且无前导零的数字，默认为 false。
 * @returns {Record<string, string | number>[]} 按原列顺序生成的数据对象。
 * @throws {Error} 表头为空、重复或表格结构无效时拒绝转换，避免 Object.fromEntries 静默覆盖数据。
 */
export function tableToObjects(input, parseNumbers = false) {
  const [first, ...rows] = parseDelimitedText(input)
  const headers = first.map((value) => value.trim())
  if (headers.some((header) => !header)) throw new Error('表头不能为空，请为每一列填写名称')
  if (new Set(headers).size !== headers.length) throw new Error('表头不能重复，请为每一列使用唯一名称')
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, parseNumbers ? safeNumber(row[index]) : row[index]])))
}

function markdownCell(value) {
  return value.replace(/\\/g, '\\\\').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '\\|').replace(/\r\n|\r|\n/g, '<br>')
}

/**
 * 将 CSV/TSV 转成 Markdown 表格，转义竖线、反斜杠与 HTML 字符，将单元格换行变为 <br>。
 * @param {string} input 第一条记录为表头的表格文本，支持引号中的分隔符和换行。
 * @returns {string} 保持原列数与空单元格的 Markdown 表格。
 * @throws {Error} 输入为空、引号错误或列数不一致时沿用解析器错误，不截断或填补错误数据。
 */
export function tableToMarkdown(input) {
  const rows = parseDelimitedText(input).map((row) => row.map(markdownCell))
  const lines = rows.map((row) => `| ${row.join(' | ')} |`)
  lines.splice(1, 0, `| ${rows[0].map(() => '---').join(' | ')} |`)
  return lines.join('\n')
}
