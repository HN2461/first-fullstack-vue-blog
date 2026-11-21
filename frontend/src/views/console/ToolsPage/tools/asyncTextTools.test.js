// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, KeepAlive, nextTick, ref } from 'vue'
import RegexTool from './RegexTool.vue'
import TextStatsTool from './TextStatsTool.vue'

const mounted = []
const workers = []

function nativeField(tag) {
  return defineComponent({
    inheritAttrs: false,
    props: ['value'],
    emits: ['update:value'],
    setup: (props, { attrs, emit }) => () => h(tag, { ...attrs, value: props.value, onInput: (event) => emit('update:value', event.target.value) })
  })
}

const passthrough = defineComponent({ inheritAttrs: false, setup: (props, { slots }) => () => slots.default?.() })

function mountTool(component) {
  const visible = ref(true)
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp(defineComponent({ setup: () => () => h(KeepAlive, null, { default: () => visible.value ? h(component) : null }) }))
  app.component('a-input', nativeField('input'))
  app.component('a-textarea', nativeField('textarea'))
  app.component('a-button', defineComponent({
    inheritAttrs: false,
    props: { disabled: Boolean },
    setup: (props, { slots, attrs }) => () => h('button', { ...attrs, disabled: props.disabled }, slots.default?.())
  }))
  app.component('a-tooltip', passthrough)
  app.component('a-popconfirm', passthrough)
  app.component('a-alert', defineComponent({ props: ['message'], setup: (props) => () => h('div', { role: 'alert' }, props.message) }))
  app.mount(root)
  const instance = {
    root,
    visible,
    unmount: () => {
      app.unmount()
      root.remove()
    }
  }
  mounted.push(instance)
  return instance
}

async function flush() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

function button(root, label) { return [...root.querySelectorAll('button')].find((item) => item.textContent === label) }
async function type(root, selector, text) {
  const field = root.querySelector(selector)
  field.value = text
  field.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

beforeEach(() => {
  vi.useFakeTimers()
  workers.length = 0
  vi.stubGlobal('Worker', class {
    constructor() {
      this.terminated = false
      workers.push(this)
    }
    postMessage() {}
    terminate() { this.terminated = true }
  })
})

afterEach(async () => {
  for (const instance of mounted.splice(0)) instance.unmount()
  await flush()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('正则任务完成与取消的界面状态', () => {
  it('手动取消显示未完成，晚到的零匹配结果也不能变成有效结果', async () => {
    const { root } = mountTool(RegexTool)
    button(root, '测试匹配').click()
    await flush()
    expect(root.textContent).toContain('正在测试')
    button(root, '取消测试').click()
    await flush()
    expect(workers[0].terminated).toBe(true)
    workers[0].onmessage({ data: { result: { matches: [], truncated: false } } })
    await flush()
    expect(root.textContent).toContain('测试已取消')
    expect(root.textContent).not.toContain('没有匹配项')
    expect(root.textContent).not.toContain('共 0 处匹配')
    expect(button(root, '复制匹配').disabled).toBe(true)
    button(root, '测试匹配').click()
    workers[1].onmessage({ data: { result: { matches: [], truncated: false } } })
    await flush()
    expect(root.textContent).toContain('没有匹配项')
    expect(root.textContent).toContain('共 0 处匹配')
    expect(root.textContent).not.toContain('测试已取消')
  })

  it('输入修改与 KeepAlive 停用都会取消未完成任务，恢复后不伪报零匹配', async () => {
    const { root, visible } = mountTool(RegexTool)
    button(root, '测试匹配').click()
    await flush()
    await type(root, '#tool-regex-text', 'changed')
    expect(root.textContent).toContain('测试已取消')
    expect(workers[0].terminated).toBe(true)
    button(root, '测试匹配').click()
    await flush()
    visible.value = false
    await flush()
    expect(workers[1].terminated).toBe(true)
    visible.value = true
    await flush()
    expect(root.textContent).toContain('测试已取消')
    expect(root.textContent).not.toContain('共 0 处匹配')
  })
})

describe('文本统计防抖与结果保护', () => {
  it('停止输入150毫秒后统计，等待期间隐藏旧结果并禁止复制', async () => {
    const { root } = mountTool(TextStatsTool)
    await type(root, 'textarea', 'hello')
    expect(root.textContent).toContain('等待输入结束后更新统计')
    expect(root.querySelector('dl')).toBeNull()
    expect(button(root, '复制统计').disabled).toBe(true)
    await vi.advanceTimersByTimeAsync(149)
    expect(root.querySelector('dl')).toBeNull()
    await type(root, 'textarea', 'hello😀')
    await vi.advanceTimersByTimeAsync(149)
    expect(root.querySelector('dl')).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    await flush()
    expect(root.querySelector('dd').textContent).toBe('6')
    expect(button(root, '复制统计').disabled).toBe(false)
  })

  it('超过十万字符保留输入并报错，不截断输入或允许复制旧统计', async () => {
    const { root } = mountTool(TextStatsTool)
    await type(root, 'textarea', 'ok')
    await vi.advanceTimersByTimeAsync(150)
    await type(root, 'textarea', 'a'.repeat(100001))
    expect(root.querySelector('[role="alert"]').textContent).toContain('100,000')
    expect(root.querySelector('textarea').value).toHaveLength(100001)
    expect(root.querySelector('dl')).toBeNull()
    expect(button(root, '复制统计').disabled).toBe(true)
    await type(root, 'textarea', '')
    expect(root.querySelector('[role="alert"]')).toBeNull()
    expect(root.querySelector('dd').textContent).toBe('0')
  })

  it('停用清理待执行计时器，恢复后重新统计当前文本', async () => {
    const { root, visible } = mountTool(TextStatsTool)
    await type(root, 'textarea', '😀')
    visible.value = false
    await flush()
    await vi.advanceTimersByTimeAsync(200)
    visible.value = true
    await flush()
    expect(root.textContent).toContain('等待输入结束后更新统计')
    await vi.advanceTimersByTimeAsync(150)
    await flush()
    expect(root.querySelector('dd').textContent).toBe('1')
  })
})
