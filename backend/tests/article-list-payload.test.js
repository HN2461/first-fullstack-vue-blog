import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const articleDoc = {
    toSafeJSON: vi.fn(() => ({ id: 'article-1', title: '列表轻量响应验证' }))
  }
  const queryChain = {
    populate: vi.fn(() => queryChain),
    sort: vi.fn(() => queryChain),
    skip: vi.fn(() => queryChain),
    limit: vi.fn(async () => [articleDoc])
  }
  const Article = {
    countDocuments: vi.fn(async () => 1),
    find: vi.fn(() => queryChain)
  }

  return { Article, articleDoc, queryChain }
})

vi.mock('#modules/content/models/Article.js', () => ({
  Article: mocks.Article
}))

vi.mock('#modules/content/models/Category.js', () => ({
  Category: {
    find: vi.fn()
  }
}))

const { listArticles } = await import('#modules/content/services/article.service.js')

describe('article list payload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('omits heavy article body fields from paged lists', async () => {
    const result = await listArticles({
      status: 'published',
      pageSize: 5
    })

    expect(result.items).toEqual([{ id: 'article-1', title: '列表轻量响应验证' }])
    expect(mocks.articleDoc.toSafeJSON).toHaveBeenCalledWith({
      includeContent: false,
      includeResources: false
    })
  })
})
