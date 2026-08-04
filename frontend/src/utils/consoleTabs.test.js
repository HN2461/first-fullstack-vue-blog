import { describe, expect, it } from 'vitest'
import { buildConsoleTabKey, createConsoleTab, findExactRouteMenu } from './consoleTabs'

const rootMenus = [
  {
    code: 'management.root',
    children: [
      {
        code: 'content.articles',
        name: '文章管理',
        routePath: '/console/manage/articles',
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
})
