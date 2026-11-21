import { describe, expect, it, vi } from 'vitest'
import { queryTools, readToolPreferences, saveToolPreferences } from './toolNavigation'

const catalog = [
  { key: 'csv-json', name: 'CSV 转 JSON', category: 'data', description: '将表格文本转换成 JSON 数组' },
  { key: 'json', name: 'JSON 格式化', category: 'data', description: '格式化、压缩并校验 JSON 文本' },
  { key: 'regex', name: '正则测试', category: 'web', description: '实时查看匹配结果和捕获组' },
  { key: 'timestamp', name: '时间戳转换', category: 'time', description: '在日期、秒和毫秒时间戳之间转换' },
  { key: 'line-tools', name: '文本行处理', category: 'text', description: '排序、去重和清理文本行' },
  { key: 'jwt', name: 'JWT 解码', category: 'web', description: '查看 Header 与 Payload' },
  { key: 'color', name: '颜色转换', category: 'web', description: 'HEX、RGB 和 HSL 互转' }
]

function keys(tools) {
  return tools.map((tool) => tool.key)
}

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values
  }
}

describe('queryTools', () => {
  it('支持中文用途、英文别名和全角大小写，并让准确工具排在描述提及项前面', () => {
    expect(keys(queryTools(catalog, { query: 'ＪＳＯＮ' }))).toEqual(['json', 'csv-json', 'jwt'])
    expect(keys(queryTools(catalog, { query: 'REGEXP' }))).toEqual(['regex'])
    expect(keys(queryTools(catalog, { query: '去重' }))).toEqual(['line-tools'])
    expect(keys(queryTools(catalog, { query: 'token' }))).toEqual(['jwt'])
    expect(keys(queryTools(catalog, { query: 'hex' }))).toEqual(['color'])
  })

  it('多个词同时约束结果，不将零散字符视为模糊命中', () => {
    expect(keys(queryTools(catalog, { query: 'json  压缩' }))).toEqual(['json'])
    expect(keys(queryTools(catalog, { query: '日期\t毫秒' }))).toEqual(['timestamp'])
    expect(queryTools(catalog, { query: 'json 捕获' })).toEqual([])
    expect(queryTools(catalog, { query: '正测' })).toEqual([])
  })

  it('分类、收藏和搜索可以交叉筛选，且不更改目录或原始工具对象', () => {
    const options = { category: 'web', view: 'favorites', favoriteKeys: ['json', 'regex', 'jwt'], query: '解码' }
    const result = queryTools(catalog, options)
    expect(keys(result)).toEqual(['jwt'])
    expect(result[0]).toBe(catalog[5])
    expect(catalog[0].key).toBe('csv-json')
  })

  it('最近视图按真实最近顺序展示，并在筛选后保持顺序', () => {
    const recentKeys = ['jwt', 'missing', 'regex', 'jwt', 'json']
    expect(keys(queryTools(catalog, { view: 'recent', recentKeys }))).toEqual(['jwt', 'regex', 'json'])
    expect(keys(queryTools(catalog, { view: 'recent', recentKeys, category: 'web' }))).toEqual(['jwt', 'regex'])
    expect(keys(queryTools(catalog, { view: 'recent', recentKeys, query: 'json' }))).toEqual(['json', 'jwt'])
  })

  it('允许新增工具显式登记关键词，空查询维持目录顺序', () => {
    const extended = [...catalog, { key: 'custom', name: '自定义工具', category: 'text', keywords: ['字段清洗'] }]
    expect(keys(queryTools(extended, { query: '字段清洗' }))).toEqual(['custom'])
    expect(queryTools(catalog, { query: '  ' })).toEqual(catalog)
    expect(queryTools(null)).toEqual([])
    expect(queryTools(catalog, { view: 'favorites' })).toEqual([])
  })
})

describe('tool preferences', () => {
  it('不同账号读取独立偏好，且不读取旧的无归属键', () => {
    const storage = memoryStorage()
    storage.setItem('tools:favorites', JSON.stringify(['timestamp']))
    saveToolPreferences(storage, 'user-a', { favoriteKeys: ['json'], recentKeys: ['regex'] })
    saveToolPreferences(storage, 'user-b', { favoriteKeys: ['jwt'], recentKeys: ['json'] })
    const validKeys = catalog.map((tool) => tool.key)
    expect(readToolPreferences(storage, 'user-a', validKeys)).toEqual({ favoriteKeys: ['json'], recentKeys: ['regex'] })
    expect(readToolPreferences(storage, 'user-b', validKeys)).toEqual({ favoriteKeys: ['jwt'], recentKeys: ['json'] })
    expect(readToolPreferences(storage, 'user-c', validKeys)).toEqual({ favoriteKeys: [], recentKeys: [] })
  })

  it('只保存工具标识，去重并裁剪最近访问，读取过滤已移除的工具', () => {
    const storage = memoryStorage()
    const toolKeys = Array.from({ length: 10 }, (_, index) => `tool-${index}`)
    saveToolPreferences(storage, 'user-a', {
      favoriteKeys: ['json', 'json', 2, null, 'removed', 'has spaces'],
      recentKeys: [toolKeys[0], ...toolKeys],
      input: 'sensitive token',
      output: 'private result'
    })
    expect(readToolPreferences(storage, 'user-a', ['json', ...toolKeys])).toEqual({
      favoriteKeys: ['json'],
      recentKeys: toolKeys.slice(0, 8)
    })
    const savedValue = [...storage.values.values()][0]
    expect(Object.keys(JSON.parse(savedValue))).toEqual(['favoriteKeys', 'recentKeys'])
    expect(savedValue).not.toContain('sensitive')
    expect(savedValue).not.toContain('private')
  })

  it('没有账号时完全跳过存储，不建立匿名共享偏好', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn()
    }
    for (const userId of [undefined, null, '', '  ', {}]) {
      expect(readToolPreferences(storage, userId, ['json'])).toEqual({ favoriteKeys: [], recentKeys: [] })
      expect(saveToolPreferences(storage, userId, { favoriteKeys: ['json'] })).toEqual({ favoriteKeys: [], recentKeys: [] })
    }
    expect(storage.getItem).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('损坏、字段类型错误或受限存储都不阻断页面', () => {
    const validKeys = new Set(['json'])
    expect(readToolPreferences({ getItem: () => '{broken' }, 'user-a', validKeys)).toEqual({ favoriteKeys: [], recentKeys: [] })
    expect(readToolPreferences({ getItem: () => JSON.stringify({ favoriteKeys: 'json', recentKeys: [null, 'json'] }) }, 'user-a', validKeys))
      .toEqual({ favoriteKeys: [], recentKeys: ['json'] })
    expect(readToolPreferences({ getItem: () => { throw new Error('denied') } }, 'user-a', validKeys)).toEqual({ favoriteKeys: [], recentKeys: [] })
    expect(saveToolPreferences({ setItem: () => { throw new Error('quota') } }, 'user-a', { favoriteKeys: ['json'] }))
      .toEqual({ favoriteKeys: ['json'], recentKeys: [] })
    expect(readToolPreferences(null, 'user-a', validKeys)).toEqual({ favoriteKeys: [], recentKeys: [] })
  })
})
