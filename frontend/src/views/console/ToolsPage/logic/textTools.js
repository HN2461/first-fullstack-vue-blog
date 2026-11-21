import { assertToolText, MAX_STATS_TEXT_LENGTH } from './textLimits'

const LINE_BREAK = /\r\n|[\r\n\u2028\u2029]/
const STOPWORDS = new Set(['a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'for'])
const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', _: '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
}
const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE).map(([letter, code]) => [code, letter]))
const PLACEHOLDER_TEXT = {
  zh: ['清晨的光穿过窗边，新的记录从一个清晰的问题开始。', '将复杂的想法拆成可以验证的小步骤，让每次尝试留下依据。', '知识来自观察与实践，也来自对细节保持耐心。', '为内容建立清楚的结构，方便未来的自己快速找到答案。'],
  en: ['A clear question is the beginning of a useful experiment.', 'Small, deliberate steps turn ideas into reliable knowledge.', 'Good documentation makes today’s decisions understandable tomorrow.', 'Careful observation reveals details that first impressions often miss.']
}

/**
 * 统计 Unicode 文本，不将代理对误算为两个字符。
 * @param {string} text 原始文本；CRLF、CR、LF、Unicode 行分隔符均视为换行。
 * @returns {Array<{label: string, value: number}>} 码点、字素、非空白码点、词语、行与 UTF-8 字节数。
 * 最多 100000 个 UTF-16 字符，超限抛错；空文本各项为零，缺少 Intl.Segmenter 时退回码点/词段统计。
 */
export function getTextStats(text) {
  const source = assertToolText(text, MAX_STATS_TEXT_LENGTH)
  const codePoints = Array.from(source)
  const segmenter = typeof Intl.Segmenter === 'function'
  let graphemes = codePoints.length
  let words = (source.match(/[\p{L}\p{N}]+/gu) || []).length
  if (segmenter) {
    graphemes = 0
    words = 0
    // 只累计数量，不保留每个分词对象及其输入引用，控制大文本的内存占用。
    for (const part of new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }).segment(source)) graphemes += 1
    for (const part of new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(source)) if (part.isWordLike) words += 1
  }
  return [
    { label: '字符数（码点）', value: codePoints.length },
    { label: '字素数（组合字符）', value: graphemes },
    { label: '非空白字符', value: codePoints.filter((char) => !/\s/u.test(char)).length },
    { label: '词语数', value: words },
    { label: '行数', value: source ? source.split(LINE_BREAK).length : 0 },
    { label: 'UTF-8 字节', value: new TextEncoder().encode(source).length }
  ]
}

function splitWords(text) {
  return text
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}\p{M}]+/u)
    .filter(Boolean)
}

function capitalize(word) {
  const [first = '', ...rest] = Array.from(word.toLowerCase())
  return first.toUpperCase() + rest.join('')
}

/**
 * 转换文本大小写和命名格式，识别 camelCase 与 HTTPServer 一类缩写词边界。
 * @param {string} text 待转换文本，大小写模式保留原空白和标点。
 * @param {string} mode upper/lower/title/camel/pascal/snake/kebab。
 * @returns {string} 转换后的文本；空输入返回空串，未知模式或超过 1 Mi 字符时抛错。
 */
export function convertTextCase(text, mode) {
  const source = assertToolText(text)
  if (mode === 'upper') return source.toUpperCase()
  if (mode === 'lower') return source.toLowerCase()
  const words = splitWords(source)
  if (mode === 'title') return words.map(capitalize).join(' ')
  if (mode === 'pascal') return words.map(capitalize).join('')
  if (mode === 'camel') return words.map((word, index) => index ? capitalize(word) : word.toLowerCase()).join('')
  if (mode === 'snake') return words.map((word) => word.toLowerCase()).join('_')
  if (mode === 'kebab') return words.map((word) => word.toLowerCase()).join('-')
  throw new Error('请选择支持的文本格式')
}

/**
 * 按行转换文本，仅在明确选择清理模式时修剪空白与删除空行。
 * @param {string} text 原始文本，兼容 CRLF、CR、LF 及 Unicode 换行。
 * @param {string} mode sort/reverse/unique/trim，去重保留首次出现的完整原行。
 * @returns {string} 以 LF 连接的结果；保留原行内容，未知模式或超过 1 Mi 字符时抛错。
 */
export function processTextLines(text, mode) {
  let lines = assertToolText(text).split(LINE_BREAK)
  if (mode === 'sort') lines.sort((left, right) => left.localeCompare(right, 'zh-CN'))
  else if (mode === 'reverse') lines.reverse()
  else if (mode === 'unique') lines = [...new Set(lines)]
  else if (mode === 'trim') lines = lines.map((line) => line.trim()).filter(Boolean)
  else throw new Error('请选择支持的文本行操作')
  return lines.join('\n')
}

/**
 * 生成 URL 标识，保留中文等 Unicode 字母，不额外对结果执行网址编码。
 * @param {string} text 标题或文本，兼容全角字符并移除拉丁字母重音。
 * @param {boolean} removeStopwords 是否移除独立英文常见连接词，默认保留原词。
 * @returns {string} 小写、单连字符分隔的 Slug；纯符号返回空串，超过 1 Mi 字符时抛错。
 */
export function createSlug(text, removeStopwords = false) {
  const source = assertToolText(text).normalize('NFKC')
    .replace(/\p{Script=Latin}[\p{Script=Latin}\p{M}]*/gu, (word) => word.normalize('NFKD').replace(/\p{M}/gu, ''))
    .toLowerCase()
  return source.split(/[^\p{L}\p{N}\p{M}]+/u)
    .filter((word) => word && (!removeStopwords || !STOPWORDS.has(word)))
    .join('-')
}

/**
 * 转换国际摩斯电码，支持 A–Z、0–9 和常见标点；单词以斜杠分隔。
 * @param {string} text 英文文本或由点、横线、空格和单词分隔斜杠组成的电码。
 * @param {string} mode encode/decode，编码时连续空白统一成单个单词边界。
 * @returns {string} 编码或大写解码结果；超出 1 Mi 字符、不支持字符、未知电码与模式均抛错。
 */
export function translateMorse(text, mode) {
  const source = assertToolText(text).trim()
  if (mode === 'encode') {
    return source ? source.split(/\s+/u).map((word) => Array.from(word).map((char) => {
      const value = MORSE[char.toUpperCase()]
      if (!value) throw new Error(`不支持字符“${char}”，请使用英文字母、数字或常见标点`)
      return value
    }).join(' ')).join(' / ') : ''
  }
  if (mode !== 'decode') throw new Error('请选择编码或解码模式')
  if (!source) return ''
  return source.split(/\s*\/\s*/u).map((word) => {
    if (!word.trim()) throw new Error('单词分隔符 / 前后必须包含电码')
    return word.trim().split(/\s+/u).map((code) => {
      if (!Object.hasOwn(MORSE_REVERSE, code)) throw new Error(`无法识别电码“${code}”，字符用空格分隔，单词用 / 分隔`)
      return MORSE_REVERSE[code]
    }).join('')
  }).join(' ')
}

/**
 * 生成指定数量的中文/英文段落或有效 JavaScript 占位代码。
 * @param {string} kind zh/en/code，代码不额外添加破坏语法的数字前缀。
 * @param {number} count 段落数或代码行数，必须是 1–100 的整数。
 * @param {Function} random 可替换的 [0,1) 随机源，用于文本选择和确定性验证。
 * @returns {string} 生成文本；非法类型、空数量或越界数量抛错，不静默截断或补默认值。
 */
export function generatePlaceholder(kind, count, random = Math.random) {
  if (!['zh', 'en', 'code'].includes(kind)) throw new Error('请选择支持的文本类型')
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 100) throw new Error('数量必须是 1–100 的整数')
  if (kind === 'code') return Array.from({ length: count }, (_, index) => `const sample${index + 1} = { id: ${index + 1}, title: '示例 ${index + 1}', active: true }`).join('\n')
  const corpus = PLACEHOLDER_TEXT[kind]
  return Array.from({ length: count }, () => {
    const value = random()
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('随机源返回值不在有效范围内')
    return corpus[Math.floor(value * corpus.length)]
  }).join('\n\n')
}
