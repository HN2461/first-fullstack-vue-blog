import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useConsoleTabsStore } from './consoleTabs'

const homeRoute = createRoute({
  name: 'AdminStats',
  path: '/console',
  fullPath: '/console',
  meta: { title: '管理工作台' }
})

const articlesRoute = createRoute({
  name: 'AdminArticles',
  path: '/console/manage/articles',
  fullPath: '/console/manage/articles',
  meta: { title: '文章管理' }
})

function createRoute(overrides = {}) {
  const route = {
    name: 'ConsolePage',
    path: '/console/page',
    fullPath: '/console/page',
    params: {},
    meta: {},
    ...overrides
  }
  return { ...route, matched: [{ name: route.name }] }
}

function createRouter() {
  return {
    resolve(value) {
      if (typeof value === 'object') return value
      if (value === '/console') return homeRoute
      if (value === '/console/manage/articles') return articlesRoute
      return createRoute({ path: value, fullPath: value })
    }
  }
}

function createSessionStorage() {
  const values = new Map()
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    removeItem: vi.fn((key) => values.delete(key))
  }
}

function initializeStore(store, userId = 'user-1') {
  store.initialize({
    userId,
    router: createRouter(),
    canAccessPath: () => true,
    rootMenus: [],
    homePath: '/console'
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('sessionStorage', createSessionStorage())
})

afterEach(() => vi.unstubAllGlobals())

describe('console tabs store', () => {
  it('pins the home tab only when a session has no restorable tabs', () => {
    const store = useConsoleTabsStore()

    initializeStore(store)

    expect(store.tabs).toHaveLength(1)
    expect(store.tabs[0]).toMatchObject({ key: 'AdminStats', affix: true })
  })

  it('restores existing tabs without forcing the home tab back in', () => {
    sessionStorage.setItem('console-tabs:v1:user-1', JSON.stringify([
      {
        key: 'AdminArticles',
        name: 'AdminArticles',
        title: '文章管理',
        fullPath: '/console/manage/articles',
        path: '/console/manage/articles',
        affix: false
      }
    ]))
    const store = useConsoleTabsStore()

    initializeStore(store)

    expect(store.tabs.map((tab) => tab.key)).toEqual(['AdminArticles'])
  })

  it('persists custom pin state and never removes the only tab', () => {
    const store = useConsoleTabsStore()
    initializeStore(store)

    expect(store.setAffix('AdminStats', false)).toBe(true)
    expect(store.tabs[0].affix).toBe(false)
    expect(store.remove('AdminStats')).toBe(false)
    expect(store.tabs).toHaveLength(1)
  })

  it('keeps only the selected tab even when other tabs are pinned', () => {
    const store = useConsoleTabsStore()
    initializeStore(store)
    store.addRoute(articlesRoute, [], { affix: true })

    expect(store.keepOnly('AdminArticles')).toBe(true)
    expect(store.tabs).toHaveLength(1)
    expect(store.tabs[0]).toMatchObject({ key: 'AdminArticles', affix: true })
  })
})
