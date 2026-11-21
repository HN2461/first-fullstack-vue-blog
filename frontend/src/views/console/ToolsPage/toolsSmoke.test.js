// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { TextDecoder, TextEncoder } from 'node:util'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import Antd from 'ant-design-vue'
import { EditorView } from '@codemirror/view'
import { TOOL_CATALOG } from './toolCatalog'
import { processJson } from './logic/json'
import { processBase64 } from './logic/base64'
import { executeRegex } from './logic/regex'

let app
let host
let styleSpy
const errors = []
const rangeDescriptors = new Map()

class LocalWorker {
  constructor(url) {
    this.regex = String(url).includes('regex.worker')
    this.closed = false
  }

  postMessage(data) {
    // 只替代 jsdom 缺少的 Worker 传输，组件、编辑器和转换算法均执行真实实现。
    queueMicrotask(() => {
      if (this.closed) return
      try {
        const result = this.regex ? executeRegex(data) : data.tool === 'json' ? processJson(data.options) : processBase64(data.options)
        this.onmessage?.({ data: { result } })
      } catch (cause) {
        const error = this.regex ? cause.message : { message: cause.message, offset: cause.offset, line: cause.line, column: cause.column }
        this.onmessage?.({ data: { error } })
      }
    })
  }

  terminate() { this.closed = true }
}

beforeAll(() => {
  // Node 编码器返回其自身 realm 的字节数组；转入 jsdom realm，模拟浏览器原生类型一致性。
  vi.stubGlobal('TextEncoder', class {
    encode(value) { return Uint8Array.from(new TextEncoder().encode(value)) }
  })
  vi.stubGlobal('TextDecoder', TextDecoder)
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('Worker', LocalWorker)
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', (media) => ({ matches: false, media, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true } }))
  for (const [key, value] of [['getBoundingClientRect', () => new DOMRect()], ['getClientRects', () => []]]) {
    rangeDescriptors.set(key, Object.getOwnPropertyDescriptor(Range.prototype, key))
    Object.defineProperty(Range.prototype, key, { configurable: true, value })
  }
  const getStyle = window.getComputedStyle.bind(window)
  styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => getStyle(element))
})

afterEach(async () => {
  app?.unmount()
  app = null
  await nextTick()
  host?.remove()
  document.body.replaceChildren()
})

afterAll(() => {
  styleSpy?.mockRestore()
  for (const [key, descriptor] of rangeDescriptors) {
    if (descriptor) Object.defineProperty(Range.prototype, key, descriptor)
    else delete Range.prototype[key]
  }
  vi.unstubAllGlobals()
})

async function flush() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

async function input(selector, value) {
  const element = host.querySelector(selector)
  expect(element, selector).not.toBeNull()
  element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

async function click(selector = '.ant-btn-primary') {
  const element = host.querySelector(selector)
  expect(element, selector).not.toBeNull()
  expect(element.disabled).not.toBe(true)
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await flush()
}

function button(text) {
  const element = [...host.querySelectorAll('button')].find((item) => item.textContent.replace(/\s/g, '') === text)
  expect(element, text).not.toBeUndefined()
  return element
}

const textVectors = {
  url: ['知识库 & 工具箱', '%E7%9F%A5%E8%AF%86%E5%BA%93%20%26%20%E5%B7%A5%E5%85%B7%E7%AE%B1'],
  'html-entity': ['<p>& 中文</p>', '&lt;p&gt;&amp; 中文&lt;/p&gt;'],
  case: ['hello World', 'HELLO WORLD'],
  color: ['#1677ff', 'rgb(22, 119, 255)'],
  'number-base': ['9007199254740993', '20000000000001'],
  'query-string': ['?tag=Vue&tag=Node&zero=0', '"value": "0"'],
  slug: ['Vue 3 中文指南', 'vue-3-中文指南'],
  'line-tools': ['b\na\nb', 'a\nb\nb'],
  morse: ['SOS', '... --- ...'],
  'markdown-table': ['name\tage\n小明\t18', '| 小明 | 18 |'],
  'csv-json': ['id,active\n00123,false', '"active": "false"']
}

async function exercise(key) {
  if (textVectors[key]) {
    const [source, expected] = textVectors[key]
    await input('textarea:not([readonly])', source)
    await click()
    expect(host.querySelector('textarea[readonly]').value).toContain(expected)
    return
  }
  if (key === 'json' || key === 'base64') {
    await click(key === 'json' ? '[aria-label="载入 JSON 示例"]' : '[aria-label="载入示例"]')
    await click()
    await vi.waitFor(() => {
      const editors = [...host.querySelectorAll('.cm-editor')].map((node) => EditorView.findFromDOM(node))
      expect(editors).toHaveLength(2)
      const output = editors[1].state.doc.toString()
      expect(output).toContain(key === 'json' ? '9007199254740993' : '5L2g5aW977yM5bel5YW3566x77yB')
    })
    return
  }
  if (key === 'regex') {
    await input('#tool-regex-pattern', '(?<digits>\\d+)')
    await input('#tool-regex-text', 'a12 b3')
    await click()
    await vi.waitFor(() => expect(host.querySelectorAll('.regex-match')).toHaveLength(2))
    expect(host.textContent).toContain('具名组 digits')
    expect(host.querySelector('.regex-match-value').textContent).toBe('12')
    return
  }
  if (key === 'hash') {
    await input('#tool-hash-input', 'abc')
    await click()
    await vi.waitFor(() => expect(host.querySelector('#tool-hash-output').value).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'))
    return
  }
  if (key === 'jwt') {
    const segment = (value) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    await input('#tool-jwt-input', segment({ alg: 'HS256' }) + '.' + segment({ sub: '123', exp: 0 }) + '.AQID')
    await click()
    expect(host.querySelector('#tool-jwt-header').value).toContain('"alg": "HS256"')
    expect(host.querySelector('#tool-jwt-payload').value).toContain('"sub": "123"')
    expect(host.textContent).toContain('已过期')
    return
  }
  if (key === 'text-stats') {
    await input('#tool-text-stats-input', 'A😀')
    await vi.waitFor(() => expect(host.querySelector('.text-stats-values')).not.toBeNull())
    const values = [...host.querySelectorAll('.text-stats-values > div')]
    expect(values.find((item) => item.textContent.includes('字符数（码点）')).querySelector('dd').textContent).toBe('2')
    expect(values.find((item) => item.textContent.includes('UTF-8 字节')).querySelector('dd').textContent).toBe('5')
    return
  }
  if (key === 'timestamp') {
    await input('#tool-timestamp-date', '1970-01-01T00:00:00Z')
    await click()
    expect(host.textContent).toContain('1970-01-01T00:00:00.000Z')
    expect([...host.querySelectorAll('.timestamp-result-row code')].at(-1).textContent).toBe('0')
    return
  }
  if (key === 'picker') {
    await input('#tool-picker-items', '唯一候选')
    await click()
    expect(host.querySelector('.picker-result strong').textContent).toBe('唯一候选')
    return
  }
  if (key === 'password') {
    await click()
    const value = host.querySelector('.password-output').textContent
    expect(value).toHaveLength(20)
    for (const pattern of [/[A-Z]/, /[a-z]/, /[2-9]/, /[!@#$%^&*_=+?\-]/]) expect(value).toMatch(pattern)
    return
  }
  if (key === 'uuid') {
    await click()
    const values = [...host.querySelectorAll('.uuid-list code')]
    expect(values).toHaveLength(5)
    values.forEach((node) => expect(node.textContent).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/))
    return
  }
  if (key === 'dice') {
    await click()
    const value = Number(host.querySelector('.dice-values code').textContent)
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(6)
    return
  }
  if (key === 'coin') {
    await click()
    const counts = [...host.querySelectorAll('.coin-stats strong')].map((node) => Number(node.textContent))
    expect(counts.reduce((sum, value) => sum + value, 0)).toBe(100)
    return
  }
  if (key === 'percentage' || key === 'ratio' || key === 'bmi') {
    await click()
    expect(host.querySelector('.' + (key === 'bmi' ? 'bmi' : key) + '-result strong').textContent).toBe({ percentage: '80.00', ratio: '1080.00', bmi: '21.2' }[key])
    return
  }
  if (key === 'date-diff') {
    await input('#tool-date-start', '2024-02-28')
    await input('#tool-date-end', '2024-03-01')
    await click()
    expect(host.querySelector('.date-diff-result strong').textContent).toBe('2')
    return
  }
  if (key === 'lorem') {
    await click()
    const value = host.querySelector('#tool-lorem-output').value
    expect(value.split('\n\n')).toHaveLength(3)
    expect(value.length).toBeGreaterThan(20)
    return
  }
  if (key === 'stopwatch') {
    await click()
    await vi.waitFor(() => expect(host.querySelector('.stopwatch-display').textContent).not.toBe('00:00.00'))
    button('分段').click()
    await flush()
    expect(host.querySelectorAll('.stopwatch-lap')).toHaveLength(1)
    await click()
    expect(button('开始')).toBeDefined()
    return
  }
  throw new Error('缺少工具 smoke 向量：' + key)
}

describe('工具目录 29 项真实组件接线', () => {
  it.each(TOOL_CATALOG)('$key：正常输入与真实操作可得到结果且无应用异常', async (tool) => {
    errors.length = 0
    host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({ render: () => h(tool.component) })
    app.use(Antd)
    app.config.errorHandler = (cause) => errors.push(cause)
    app.mount(host)
    await vi.waitFor(() => expect(host.querySelector('.tool-panel, .tool-text-workspace, .developer-tool-workspace')).not.toBeNull())
    await exercise(tool.key)
    await flush()
    expect(errors).toEqual([])
    expect(host.querySelector('[role="alert"]')).toBeNull()
  }, 10000)
})
