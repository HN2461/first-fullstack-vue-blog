// @vitest-environment jsdom

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import Antd, { theme } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { useConsoleTabsStore } from '@/stores/consoleTabs'
import ToolsPage from './index.vue'

const globalStyles = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8')

const workspaceLayer = 1200
let app
let host
let computedStyleSpy
let globalStyle
const popupTokens = []
const rangeDescriptors = new Map()

beforeAll(() => {
  // jsdom 没有排版引擎；补齐测量接口，浮层组件与实际主题注入仍使用 Ant Design Vue。
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  vi.stubGlobal('matchMedia', vi.fn((query) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true } })))
  for (const [name, implementation] of [['getBoundingClientRect', () => new DOMRect()], ['getClientRects', () => []]]) {
    rangeDescriptors.set(name, Object.getOwnPropertyDescriptor(Range.prototype, name))
    Object.defineProperty(Range.prototype, name, { configurable: true, value: implementation })
  }
  const getComputedStyle = window.getComputedStyle.bind(window)
  // Antd 的滚动条探测会请求伪元素；jsdom 不支持第二参数，常规元素样式照常真实计算。
  computedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => getComputedStyle(element))
})

beforeEach(async () => {
  globalStyle = document.createElement('style')
  globalStyle.textContent = globalStyles
  document.head.appendChild(globalStyle)
  document.body.classList.add('console-workspace-maximized')
  localStorage.clear()
  sessionStorage.clear()
  popupTokens.length = 0
  host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.zIndex = String(workspaceLayer)
  document.body.appendChild(host)
  const pinia = createPinia()
  useAuthStore(pinia).user = { id: 'popup-test-user', role: 'admin' }
  useConsoleTabsStore(pinia).maximized = true
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/console/tools/:toolKey?', component: ToolsPage }] })
  await router.push('/console/tools/json')
  await router.isReady()
  app = createApp({ render: () => h(RouterView) })
  app.use(pinia)
  app.use(router)
  app.use(Antd)
  app.mixin({
    mounted() {
      if (['AModal', 'ASelect', 'APopover'].includes(this.$options.name)) {
        // 在真实组件挂载上下文读取合并后的主题，辅助定位样式与 provider 继承问题。
        const { token } = theme.useToken()
        popupTokens.push({ name: this.$options.name, base: token.value.zIndexPopupBase })
      }
    }
  })
  app.mount(host)
  await vi.waitFor(() => expect(host.querySelector('.tools-switcher')).not.toBeNull())
  await vi.waitFor(() => expect(host.querySelector('.developer-tool-workspace')).not.toBeNull())
})

afterEach(async () => {
  app?.unmount()
  await nextTick()
  host?.remove()
  globalStyle?.remove()
  // Modal、Select 和 Popover 通过 Teleport 放在 body，卸载后清除所有测试容器。
  document.body.replaceChildren()
  document.body.classList.remove('console-workspace-maximized')
})

afterAll(() => {
  computedStyleSpy?.mockRestore()
  for (const [name, descriptor] of rangeDescriptors) {
    if (descriptor) Object.defineProperty(Range.prototype, name, descriptor)
    else delete Range.prototype[name]
  }
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function click(element) {
  expect(element).not.toBeNull()
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await nextTick()
}

async function openToolPicker() {
  await click(host.querySelector('[aria-label="查找和切换工具"]'))
  await vi.waitFor(() => expect(document.querySelector('.ant-modal-wrap')).not.toBeNull())
  return document.querySelector('.ant-modal-wrap')
}

function zIndex(element) {
  const value = Number(window.getComputedStyle(element).zIndex)
  expect(Number.isFinite(value)).toBe(true)
  return value
}

describe('工具箱专注模式浮层', () => {
  it('点击当前工具名称打开选择弹窗，保持顶部安全间距并显示在专注工作区之上', async () => {
    expect(host.querySelector('.tools-page--focused')).not.toBeNull()
    const modalWrap = await openToolPicker()
    const modal = document.querySelector('.ant-modal')
    expect(modal.style.top).toBe('')
    expect(modalWrap.classList.contains('ant-modal-centered')).toBe(false)
    const position = window.getComputedStyle(modalWrap)
    expect(position.display).toBe('flex')
    expect(position.alignItems).toBe('flex-start')
    // jsdom 27 不计算含 var()/clamp() 的 padding 简写；验证真实 CSSOM 使用全局变量，
    // 像素位置仍由真实浏览器验收，不能把无排版引擎的结果当作布局测量。
    const placementRule = [...globalStyle.sheet.cssRules].find((rule) => rule.selectorText?.includes('.ant-modal-root .ant-modal-wrap') && rule.style?.getPropertyValue('padding'))
    expect(placementRule.style.getPropertyValue('padding')).toContain('var(--console-modal-top-gap)')
    expect(placementRule.style.getPropertyValue('padding')).toContain('var(--console-modal-bottom-gap)')
    const globalPosition = window.getComputedStyle(document.documentElement)
    expect(globalPosition.getPropertyValue('--console-modal-top-gap').trim()).toBe('clamp(24px, 6vh, 64px)')
    expect(globalPosition.getPropertyValue('--console-modal-bottom-gap').trim()).toBe('48px')
    expect(zIndex(modalWrap)).toBeGreaterThan(workspaceLayer)
    expect(popupTokens.some(({ name, base }) => name === 'AModal' && base > workspaceLayer)).toBe(true)
  })

  it('弹窗中的真实分类下拉高于弹窗，选择分类后保持正常筛选', async () => {
    const modalWrap = await openToolPicker()
    const selector = document.querySelector('.tool-navigator__category .ant-select-selector')
    expect(selector).not.toBeNull()
    selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    await vi.waitFor(() => expect(document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')).not.toBeNull())
    const dropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    expect(zIndex(dropdown)).toBeGreaterThan(zIndex(modalWrap))
    const textCategory = [...dropdown.querySelectorAll('.ant-select-item-option')].find((item) => item.textContent.includes('文本处理'))
    await click(textCategory)
    await vi.waitFor(() => {
      const names = [...document.querySelectorAll('.tool-navigator__body strong')].map((item) => item.textContent)
      expect(names).toContain('Markdown 表格')
      expect(names).not.toContain('JSON 格式化')
    })
  })

  it('顶部使用说明 Popover 高于专注工作区，说明内容可交互打开', async () => {
    await click(host.querySelector('[aria-label="查看使用说明"]'))
    await vi.waitFor(() => expect(document.querySelector('.ant-popover:not(.ant-popover-hidden)')).not.toBeNull())
    const popover = document.querySelector('.ant-popover:not(.ant-popover-hidden)')
    expect(popover.textContent).toContain('点击当前工具名称')
    expect(zIndex(popover)).toBeGreaterThan(workspaceLayer)
    expect(popupTokens.some(({ name, base }) => name === 'APopover' && base > workspaceLayer)).toBe(true)
  })
})
