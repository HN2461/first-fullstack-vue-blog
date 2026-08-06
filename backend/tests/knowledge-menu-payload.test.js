import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const categories = [{
    _id: 'category-1',
    name: 'Vue',
    slug: 'vue',
    parent: null,
    sortOrder: 10,
    isSystem: false,
    description: '菜单不需要分类描述'
  }]
  const articles = [{
    _id: 'article-1',
    title: '响应式原理',
    slug: 'vue-reactivity',
    category: {
      _id: 'category-1',
      name: 'Vue',
      slug: 'vue',
      isSystem: false
    },
    summary: '菜单不需要摘要',
    contentMarkdown: '# 菜单不需要正文'
  }]
  const categoryQuery = {
    select: vi.fn(() => categoryQuery),
    sort: vi.fn(() => categoryQuery),
    lean: vi.fn(async () => categories)
  }
  const articleQuery = {
    select: vi.fn(() => articleQuery),
    populate: vi.fn(() => articleQuery),
    sort: vi.fn(() => articleQuery),
    limit: vi.fn(() => articleQuery),
    lean: vi.fn(async () => articles)
  }
  const Category = {
    find: vi.fn(() => categoryQuery),
    findOne: vi.fn()
  }
  const Article = {
    find: vi.fn(() => articleQuery),
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn()
  }

  return { Article, Category, articleQuery, categoryQuery }
})

vi.mock('#modules/content/models/Article.js', () => ({
  Article: mocks.Article
}))

vi.mock('#modules/content/models/Category.js', () => ({
  Category: mocks.Category
}))

vi.mock('#modules/content/models/Tag.js', () => ({
  Tag: {}
}))

vi.mock('#modules/interaction/models/Reaction.js', () => ({
  Reaction: {}
}))

const { getKnowledgeMenuData } = await import('#modules/public/services/public.service.js')

describe('knowledge menu payload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries and returns only fields required by the directory tree', async () => {
    const result = await getKnowledgeMenuData()

    expect(mocks.categoryQuery.select).toHaveBeenCalledWith('_id name slug parent sortOrder isSystem')
    expect(mocks.articleQuery.select).toHaveBeenCalledWith('_id title slug category')
    expect(result).toEqual({
      categories: [{
        id: 'category-1',
        name: 'Vue',
        slug: 'vue',
        parent: null,
        sortOrder: 10,
        isSystem: false
      }],
      articles: [{
        id: 'article-1',
        title: '响应式原理',
        slug: 'vue-reactivity',
        category: {
          id: 'category-1',
          name: 'Vue',
          slug: 'vue',
          isSystem: false
        }
      }]
    })
  })
})
