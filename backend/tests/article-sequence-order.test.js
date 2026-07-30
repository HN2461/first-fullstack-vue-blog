import { describe, expect, it } from 'vitest'
import {
  buildNormalizedArticleOrder,
  buildNormalizedCategoryOrder,
  extractArticleSequence
} from '#modules/content/services/articleSequenceOrder.service.js'

function record(id, title, sortOrder, categoryPath = ['AI工具']) {
  return { originalId: id, title, sortOrder, categoryPath, publishedAt: '2026-07-30T00:00:00.000Z' }
}

describe('article sequence order', () => {
  it('recognizes Arabic and Chinese chapter numbers', () => {
    expect(extractArticleSequence('第八篇：Codex 桌面 App')).toBe(8)
    expect(extractArticleSequence('02-基本信息与开始节点')).toBe(2)
    expect(extractArticleSequence('Python 零基础入门 00：学习路线')).toBe(0)
    expect(extractArticleSequence('FastAPI 从 0 到 1：学习总目录')).toBe(-1)
    expect(extractArticleSequence('没有章节号的文章')).toBeNull()
  })

  it('sorts an explicit chapter series in ascending order', () => {
    const input = [
      record('four', '第四篇：实战', 10),
      record('one', '第一篇：入门', 20),
      record('three', '第三篇：配置', 30),
      record('two', '第二篇：基础', 40),
      record('nav', '学习导航', 50)
    ]
    const plan = buildNormalizedArticleOrder(input)
    expect(plan.sortOrderById.get('nav')).toBe(10)
    expect(plan.sortOrderById.get('one')).toBe(20)
    expect(plan.sortOrderById.get('two')).toBe(30)
    expect(plan.sortOrderById.get('three')).toBe(40)
    expect(plan.sortOrderById.get('four')).toBe(50)
  })

  it('preserves current order when a category has no clear series', () => {
    const input = [
      record('second', '普通文章 B', 20, ['开发基础']),
      record('first', '普通文章 A', 10, ['开发基础'])
    ]
    const plan = buildNormalizedArticleOrder(input)
    expect(plan.sortOrderById.get('first')).toBe(10)
    expect(plan.sortOrderById.get('second')).toBe(20)
    expect(plan.categoryPlans[0].useSequence).toBe(false)
  })

  it('does not interleave several ambiguous legacy series', () => {
    const input = [
      record('a-one', '.1、组件', 10, ['Vue2']),
      record('a-two', '.2、单文件组件', 20, ['Vue2']),
      record('b-one', '.1、模版语法', 30, ['Vue2']),
      record('b-two', '.2、数据代理', 40, ['Vue2'])
    ]
    const plan = buildNormalizedArticleOrder(input)
    expect(plan.categoryPlans[0].useSequence).toBe(false)
    expect(plan.sortOrderById.get('a-one')).toBe(10)
    expect(plan.sortOrderById.get('b-one')).toBe(30)
  })

  it('normalizes sibling category order while keeping the system category first', () => {
    const categories = [
      { name: '默认分类', categoryPath: ['默认分类'], sortOrder: -9999, isSystem: true },
      { name: '电脑', categoryPath: ['电脑'], sortOrder: 1 },
      { name: '常用缺易忘', categoryPath: ['常用缺易忘'], sortOrder: 0 },
      { name: '安卓APK', categoryPath: ['安卓APK'], sortOrder: 0 }
    ]
    const plan = buildNormalizedCategoryOrder(categories)
    expect(plan.sortOrderByPath.get('默认分类')).toBe(-9999)
    expect(plan.sortOrderByPath.get('安卓APK')).toBe(10)
    expect(plan.sortOrderByPath.get('常用缺易忘')).toBe(20)
    expect(plan.sortOrderByPath.get('电脑')).toBe(30)
  })
})
