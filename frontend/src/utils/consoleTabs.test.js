import { describe, expect, it } from 'vitest'
import {
  buildConsoleTabKey,
  createConsoleTab,
  findDisplayRouteMenu,
  findExactRouteMenu,
  reorderConsoleTabs,
  shouldConfirmConsoleTabClose
} from './consoleTabs'

const rootMenus = [
  {
    code: 'management.root',
    children: [
      {
        code: 'content.articles',
        name: '文章管理',
        routePath: '/console/manage/articles',
        icon: 'FileTextOutlined',
        openMode: 'current',
        pageCacheEnabled: true
      }
    ]
  }
]

function createRoute(overrides = {}) {
  return {
    name: 'AdminArticles',
    path: '/console/manage/articles',
    fullPath: '/console/manage/articles?page=2',
    params: {},
    meta: { title: '文章管理' },
    ...overrides
  }
}

describe('consoleTabs', () => {
  it('ignores ordinary query changes when building a tab key', () => {
    const first = buildConsoleTabKey(createRoute({ fullPath: '/console/manage/articles?page=1' }))
    const second = buildConsoleTabKey(createRoute({ fullPath: '/console/manage/articles?page=9&status=draft' }))

    expect(first).toBe('AdminArticles')
    expect(second).toBe(first)
  })

  it('keeps dynamic route params as separate tab instances', () => {
    const first = buildConsoleTabKey(createRoute({ name: 'AdminArticleEdit', params: { id: '1' } }))
    const second = buildConsoleTabKey(createRoute({ name: 'AdminArticleEdit', params: { id: '2' } }))

    expect(first).toBe('AdminArticleEdit:id=1')
    expect(second).toBe('AdminArticleEdit:id=2')
  })

  it('uses only an exact menu route for page cache policy', () => {
    const listRoute = createRoute()
    const editRoute = createRoute({
      name: 'AdminArticleEdit',
      path: '/console/manage/articles/123',
      fullPath: '/console/manage/articles/123',
      params: { id: '123' },
      meta: { title: '编辑文章' }
    })

    expect(findExactRouteMenu(listRoute, rootMenus)?.code).toBe('content.articles')
    expect(createConsoleTab(listRoute, rootMenus).pageCacheEnabled).toBe(true)
    expect(createConsoleTab(editRoute, rootMenus).pageCacheEnabled).toBe(false)
  })

  it('lets explicit route metadata override menu cache settings', () => {
    const route = createRoute({ meta: { title: '文章管理', pageCacheEnabled: false } })
    expect(createConsoleTab(route, rootMenus).pageCacheEnabled).toBe(false)
  })

  it('inherits an icon from the closest parent menu without inheriting its cache policy', () => {
    const detailRoute = createRoute({
      name: 'AdminArticleEdit',
      path: '/console/manage/articles/123',
      fullPath: '/console/manage/articles/123',
      params: { id: '123' },
      meta: { title: '编辑文章' }
    })

    expect(findDisplayRouteMenu(detailRoute, rootMenus)?.code).toBe('content.articles')
    expect(createConsoleTab(detailRoute, rootMenus)).toMatchObject({
      icon: 'FileTextOutlined',
      pageCacheEnabled: false
    })
  })

  it('keeps a deferred dynamic title readable until page data is loaded', () => {
    const route = createRoute({
      name: 'ConsoleDirectoryArticleDetail',
      path: '/console/article-directory/articles/css-css-a535f03e',
      fullPath: '/console/article-directory/articles/css-css-a535f03e',
      params: { slug: 'css-css-a535f03e' },
      meta: { title: '文章详情', deferTabTitle: true }
    })

    expect(createConsoleTab(route).title).toBe('文章详情')
  })

  it('reorders every tab including user-pinned tabs', () => {
    const tabs = [
      { key: 'home', affix: true },
      { key: 'articles', affix: false },
      { key: 'monthly', affix: false }
    ]

    expect(reorderConsoleTabs(tabs, 2, 1).map((tab) => tab.key)).toEqual(['home', 'monthly', 'articles'])
    expect(reorderConsoleTabs(tabs, 2, 0).map((tab) => tab.key)).toEqual(['monthly', 'home', 'articles'])
    expect(reorderConsoleTabs(tabs, 1, 2).map((tab) => tab.key)).toEqual(['home', 'monthly', 'articles'])
    expect(reorderConsoleTabs(tabs, 0, 2).map((tab) => tab.key)).toEqual(['articles', 'monthly', 'home'])
  })

  it('directly confirms dirty inactive tabs and dirty active cached tabs', () => {
    expect(shouldConfirmConsoleTabClose({ key: 'inactive', pageCacheEnabled: false }, 'active', true)).toBe(true)
    expect(shouldConfirmConsoleTabClose({ key: 'active', pageCacheEnabled: true }, 'active', true)).toBe(true)
    expect(shouldConfirmConsoleTabClose({ key: 'active', pageCacheEnabled: false }, 'active', true)).toBe(false)
    expect(shouldConfirmConsoleTabClose({ key: 'active', pageCacheEnabled: true }, 'active', false)).toBe(false)
  })
})
