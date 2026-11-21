const RECENT_LIMIT = 8
const STORAGE_PREFIX = 'tools:preferences:v1:'

// 别名只描述工具实际能力，避免按模糊字符匹配把无关工具混入结果。
const TOOL_KEYWORDS = {
  json: ['格式化', '压缩', '校验', '验证', '美化', 'format', 'formatter', 'minify'],
  base64: ['base 64', '编码', '解码', 'encode', 'decode', 'utf8', 'utf-8'],
  url: ['网址', '链接', '转义', '编码', '解码', 'uri', 'encodeuricomponent', 'decodeuricomponent'],
  regex: ['正则', '正则表达式', '匹配', '捕获组', 'regexp', 'regular expression'],
  timestamp: ['时间戳', '日期', '秒', '毫秒', 'unix', 'epoch', 'timestamp'],
  password: ['密码', '口令', '随机密码', 'password', 'secret'],
  picker: ['抽签', '抽取', '随机选择', '随机选择器', 'pick', 'random picker'],
  uuid: ['唯一标识', '标识符', 'guid', 'uuid v4'],
  hash: ['摘要', '哈希', '散列', 'sha1', 'sha-1', 'sha256', 'sha-256', 'digest'],
  jwt: ['token', '令牌', '令牌解码', 'header', 'payload', 'json web token'],
  'html-entity': ['html', '实体', '转义', '反转义', 'escape', 'unescape', 'entity'],
  'text-stats': ['字数', '统计', '字符数', '字节数', '行数', 'word count', 'text statistics'],
  case: ['大小写', '驼峰', '下划线', '命名', 'camelcase', 'snake_case', 'uppercase', 'lowercase'],
  color: ['颜色', '色值', 'hex', 'rgb', 'hsl', 'colour'],
  'number-base': ['进制', '二进制', '八进制', '十进制', '十六进制', 'binary', 'octal', 'decimal', 'hex'],
  'query-string': ['查询参数', '参数解析', 'url参数', 'url 参数', 'query', 'querystring', 'searchparams'],
  slug: ['短链接', '路径标识', 'url标识', 'url 标识', 'slugify'],
  'line-tools': ['去重', '排序', '反转', '空行', '文本行', 'deduplicate', 'sort lines'],
  stopwatch: ['秒表', '计时', '计时器', 'stopwatch', 'timer'],
  dice: ['骰子', '掷骰子', '硬币', '抛硬币', 'dice', 'coin flip'],
  lorem: ['占位', '占位文本', '假文', '随机文本', 'lorem ipsum', 'placeholder'],
  morse: ['摩斯', '摩尔斯', '电码', 'morse code'],
  'markdown-table': ['markdown', '表格', 'csv', 'tsv', 'md table'],
  'csv-json': ['csv', 'json', '表格', '表格转换', 'comma separated values'],
  percentage: ['百分比', '百分率', '占比', '折扣', '增长率', 'percent'],
  ratio: ['比例', '缩放', '尺寸', '配方', 'aspect ratio', 'scale'],
  bmi: ['身高', '体重', '身体质量指数', 'body mass index'],
  'date-diff': ['日期', '日期差', '日期间隔', '天数', 'date difference', 'days'],
  coin: ['硬币', '抛硬币', '概率', '正反面', 'coin flip']
}

function normalizeText(value) {
  return typeof value === 'string' ? value.normalize('NFKC').toLowerCase().trim() : ''
}

function getSearchFields(tool) {
  const keywords = Array.isArray(tool.keywords) ? tool.keywords : [tool.keywords]
  return {
    names: [tool.name, tool.key].map(normalizeText).filter(Boolean),
    aliases: [...(TOOL_KEYWORDS[tool.key] || []), ...keywords].map(normalizeText).filter(Boolean),
    description: normalizeText(tool.description)
  }
}

function scoreTool(tool, tokens, query) {
  const { names, aliases, description } = getSearchFields(tool)
  const scores = tokens.map((token) => {
    if (names.includes(token)) return 120
    if (aliases.includes(token)) return 100
    if (names.some((name) => name.includes(token))) return 70
    if (aliases.some((alias) => alias.includes(token))) return 50
    return description.includes(token) ? 20 : 0
  })
  if (scores.some((score) => score === 0)) return -1
  const exactBonus = [...names, ...aliases].includes(query) ? 1000 : 0
  return exactBonus + scores.reduce((sum, score) => sum + score, 0)
}

/**
 * 查询工具目录，只检索名称、标识、说明和显式别名，不读取工具输入内容。
 * @param {Array<object>} catalog 工具目录，返回结果保留其中的原始工具对象。
 * @param {object} options 搜索词、分类、视图及收藏/最近工具标识；多个词必须同时匹配。
 * @returns {Array<object>} 匹配工具；有搜索词时按相关度排序，最近视图同分按访问顺序。
 * 非数组目录返回空数组；空关键词保留目录顺序，最近视图遵循 recentKeys 顺序。
 */
export function queryTools(catalog, {
  query = '',
  category = 'all',
  view = 'all',
  favoriteKeys = [],
  recentKeys = []
} = {}) {
  if (!Array.isArray(catalog)) return []
  const normalizedQuery = normalizeText(query).replace(/\s+/g, ' ')
  const tokens = [...new Set(normalizedQuery.split(' ').filter(Boolean))]
  const favorites = new Set(normalizeKeys(favoriteKeys))
  const recentOrder = new Map(normalizeKeys(recentKeys).map((key, index) => [key, index]))

  return catalog
    .filter((tool) => tool && (category === 'all' || tool.category === category))
    .filter((tool) => view !== 'favorites' || favorites.has(tool.key))
    .filter((tool) => view !== 'recent' || recentOrder.has(tool.key))
    .map((tool, index) => ({ tool, index, score: tokens.length ? scoreTool(tool, tokens, normalizedQuery) : 0 }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => {
      const relevance = right.score - left.score
      if (relevance) return relevance
      if (view === 'recent') return recentOrder.get(left.tool.key) - recentOrder.get(right.tool.key)
      return left.index - right.index
    })
    .map(({ tool }) => tool)
}

function normalizeKeys(keys, validKeys) {
  if (!Array.isArray(keys)) return []
  return [...new Set(keys.filter((key) => typeof key === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(key)))]
    .filter((key) => !validKeys || validKeys.has(key))
}

function getStorageKey(userId) {
  // 无登录身份时不创建共享命名空间，防止同设备的不同账号混用偏好。
  if (typeof userId !== 'string' && typeof userId !== 'number') return ''
  const identity = String(userId).trim()
  return identity ? `${STORAGE_PREFIX}${encodeURIComponent(identity)}` : ''
}

function normalizePreferences(preferences, validKeys) {
  return {
    favoriteKeys: normalizeKeys(preferences?.favoriteKeys, validKeys),
    recentKeys: normalizeKeys(preferences?.recentKeys, validKeys).slice(0, RECENT_LIMIT)
  }
}

/**
 * 读取当前账号的工具收藏和最近访问，仅接收目录中仍存在的工具标识。
 * @param {Storage|object|null} storage 提供 getItem 的存储对象，允许不可用或抛错。
 * @param {string|number} userId 当前登录账号标识；缺失时不读取任何共享偏好。
 * @param {Array<string>|Set<string>} validKeys 当前有效工具标识，未提供时按空目录处理。
 * @returns {{favoriteKeys: string[], recentKeys: string[]}} 去重后的偏好，最近访问最多八项。
 * 存储损坏、访问受限或字段类型错误时返回可用的空偏好，不迁移旧的无归属键。
 */
export function readToolPreferences(storage, userId, validKeys) {
  const storageKey = getStorageKey(userId)
  if (!storageKey) return normalizePreferences(null)
  const acceptedKeys = new Set(Array.isArray(validKeys) || validKeys instanceof Set ? validKeys : [])
  try {
    return normalizePreferences(JSON.parse(storage?.getItem(storageKey) || 'null'), acceptedKeys)
  } catch {
    return normalizePreferences(null)
  }
}

/**
 * 保存当前账号的工具标识偏好，刻意忽略原始输入、输出及其他附加字段。
 * @param {Storage|object|null} storage 提供 setItem 的存储对象，允许不可用或抛错。
 * @param {string|number} userId 当前登录账号标识；缺失时跳过保存。
 * @param {object} preferences 收藏与最近工具标识，重复和非标识字段会被移除。
 * @returns {{favoriteKeys: string[], recentKeys: string[]}} 规范化偏好；写入失败仍返回该结果。
 * 保存只规范标识格式，目录有效性由读取时的 validKeys 校验；不写入旧全局键。
 */
export function saveToolPreferences(storage, userId, preferences) {
  const storageKey = getStorageKey(userId)
  if (!storageKey) return normalizePreferences(null)
  const normalized = normalizePreferences(preferences)
  try {
    storage?.setItem(storageKey, JSON.stringify(normalized))
  } catch {
    // 存储配额或隐私模式限制不能阻断当次工具使用。
  }
  return normalized
}
