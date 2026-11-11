import { createRenderer, defineComponent, h, nextTick, ssrContextKey } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MediaVaultAccess from './MediaVaultAccess.vue'
import { getAdminMediaVaultStatus } from '@/services/admin'

vi.mock('@/services/admin', () => ({
  getAdminMediaVaultStatus: vi.fn(),
  lockAdminMediaVault: vi.fn(),
  setupAdminMediaVault: vi.fn(),
  unlockAdminMediaVault: vi.fn()
}))
vi.mock('ant-design-vue', () => ({ message: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@ant-design/icons-vue', () => ({ LockOutlined: defineComponent({ render: () => null }) }))

// 无浏览器、无 DOM 的内存渲染器，只验证会话状态与组件生命周期。
const renderer = createRenderer({
  createElement: (type) => ({ type, children: [] }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ text }),
  insert(node, parent) {
    parent.children.push(node)
    node.parent = parent
  },
  remove(node) {
    if (node.parent) node.parent.children = node.parent.children.filter((item) => item !== node)
  },
  setText(node, value) {
    node.text = value
  },
  setElementText(node, value) {
    node.text = value
  },
  patchProp() {},
  parentNode: (node) => node.parent,
  nextSibling: () => null
})
const stub = defineComponent({
  setup:
    (_props, { slots }) =>
    () =>
      h('stub', slots.default?.())
})
let app
function mount() {
  const states = [],
    entered = vi.fn()
  app = renderer.createApp(MediaVaultAccess, {
    active: true,
    onStateChange: (value) => states.push(value),
    onEntered: entered
  })
  app.provide(ssrContextKey, { modules: new Set() })
  app.config.warnHandler = () => {}
  for (const name of [
    'a-tag',
    'a-tooltip',
    'a-button',
    'a-modal',
    'a-alert',
    'a-form',
    'a-form-item',
    'a-input-password'
  ])
    app.component(name, stub)
  const vm = app.mount({ children: [] })
  return { vm, states, entered }
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-11T01:00:00Z'))
  vi.stubGlobal('window', { setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval })
  vi.clearAllMocks()
})
afterEach(() => {
  app?.unmount()
  app = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('密码箱会话生命周期', () => {
  it('刷新页面继承的会话同样到期失效，不需要再次点击密码箱', async () => {
    getAdminMediaVaultStatus.mockResolvedValue({
      configured: true,
      unlocked: true,
      categoryId: 'vault',
      expiresAt: new Date(Date.now() + 2000).toISOString()
    })
    const { states, entered } = mount()
    await nextTick()
    expect(states.at(-1).unlocked).toBe(true)
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(states.at(-1).unlocked).toBe(false)
    expect(entered).not.toHaveBeenCalled()
  })

  it('现有会话仅在服务器确认后进入，到期立即通知父级卸载内容', async () => {
    getAdminMediaVaultStatus.mockResolvedValue({
      configured: true,
      unlocked: true,
      categoryId: 'vault',
      expiresAt: new Date(Date.now() + 2000).toISOString()
    })
    const { vm, states, entered } = mount()
    await vm.enter()
    expect(entered).toHaveBeenCalledOnce()
    expect(states.at(-1).unlocked).toBe(true)
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(states.at(-1).unlocked).toBe(false)
    expect(entered).toHaveBeenCalledOnce()
  })

  it('组件卸载后迟到的状态请求不能重新打开文件或留下计时器', async () => {
    let resolve
    getAdminMediaVaultStatus.mockReturnValue(
      new Promise((yes) => {
        resolve = yes
      })
    )
    const { vm, states, entered } = mount()
    const request = vm.enter()
    app.unmount()
    app = null
    resolve({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    await request
    expect(states).toEqual([])
    expect(entered).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
