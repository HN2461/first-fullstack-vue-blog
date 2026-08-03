import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const questionDataDir = path.resolve(testDir, '../src/data/questionBank')

function loadBuiltinQuestionData() {
  const categories = JSON.parse(fs.readFileSync(path.join(questionDataDir, 'categories.json'), 'utf8')).items
  const papers = JSON.parse(fs.readFileSync(path.join(questionDataDir, 'papers.json'), 'utf8')).items
  const questions = fs.readdirSync(questionDataDir)
    .filter((fileName) => /^questions-.+\.json$/i.test(fileName))
    .sort()
    .flatMap((fileName) => JSON.parse(fs.readFileSync(path.join(questionDataDir, fileName), 'utf8')).questions)
  return { categories, questions, papers }
}

describe('question bank builtin data', () => {
  it('ships broad, detailed and uniquely coded essential questions with built-in papers', () => {
    const { categories, questions, papers } = loadBuiltinQuestionData()
    const categoryKeys = new Set(categories.map((item) => item.key))
    const questionCodes = questions.map((item) => item.code)
    const questionStems = questions.map((item) => item.stem.trim())
    const frontendQuestions = questions.filter((item) => item.categoryKey.startsWith('frontend.'))
    const interviewQuestions = questions.filter((item) => item.categoryKey.startsWith('frontend.interview.'))
    const choiceQuestions = questions.filter((item) => ['single_choice', 'multiple_choice'].includes(item.type))
    const booleanQuestions = questions.filter((item) => item.type === 'true_false')
    const frontendChoiceQuestions = frontendQuestions.filter((item) => ['single_choice', 'multiple_choice'].includes(item.type))

    expect(categories).toHaveLength(27)
    const coverageQuestions = questions.filter((item) => item.code.startsWith('coverage-'))
    const leafCategoryKeys = categories
      .filter((item) => !categories.some((candidate) => candidate.parentKey === item.key))
      .map((item) => item.key)

    expect(questions).toHaveLength(846)
    expect(frontendQuestions).toHaveLength(677)
    expect(interviewQuestions).toHaveLength(210)
    expect(coverageQuestions).toHaveLength(276)
    expect(new Set(questionCodes).size).toBe(846)
    expect(new Set(questionStems).size).toBe(846)
    expect(papers).toHaveLength(29)
    expect(new Set(papers.map((item) => item.key)).size).toBe(29)
    expect(leafCategoryKeys.every((key) => coverageQuestions.filter((item) => item.categoryKey === key).length === 12)).toBe(true)
    expect([...categoryKeys]).toEqual(expect.arrayContaining([
      'frontend.react',
      'frontend.engineering',
      'frontend.performance',
      'frontend.security',
      'frontend.testing',
      'frontend.interview',
      'frontend.interview.output',
      'frontend.interview.handwritten',
      'frontend.interview.vue',
      'frontend.interview.scenario',
      'frontend.interview.algorithm'
    ]))
    expect(questions.every((item) => categoryKeys.has(item.categoryKey))).toBe(true)
    expect(questions.every((item) => item.stem?.trim() && item.answerKeys?.length && item.explanation?.trim())).toBe(true)
    expect(questions.every((item) => (item.tags || []).length <= 12 && (item.tags || []).every((tag) => tag.trim() && tag.length <= 30))).toBe(true)
    expect(frontendQuestions.every((item) => item.explanation.trim().length >= 300)).toBe(true)
    expect(interviewQuestions.every((item) => item.explanation.trim().length >= 420)).toBe(true)
    expect(frontendQuestions.every((item) => [
      '**答案与结论**',
      '**小白理解与核心原理**',
      '**项目实践与排错**',
      '**常见误区与面试追问**'
    ].every((heading) => item.explanation.includes(heading)))).toBe(true)
    expect(frontendChoiceQuestions.every((item) => item.explanation.includes('**逐项分析**'))).toBe(true)
    expect(frontendQuestions.every((item) => !/待补充|TODO|暂无解析|略$/.test(item.explanation))).toBe(true)
    expect(coverageQuestions.every((item) => item.type === 'short_answer' && item.assessmentMode === 'self')).toBe(true)
    expect(coverageQuestions.every((item) => item.explanation.length >= 500)).toBe(true)
    expect(coverageQuestions.every((item) => [
      '**答案与结论**',
      '**参考作答框架**',
      '**小白理解与核心原理**',
      '**项目实践与排错**',
      '**常见误区与面试追问**'
    ].every((heading) => item.explanation.includes(heading)))).toBe(true)
    expect(questions.find((item) => item.code === 'interview-vue-003-ref-unwrapping').explanation).toContain('reactive 数组元素或 Map')
    expect(questions.find((item) => item.code === 'interview-vue-014-keep-alive').explanation).toContain('暂时离开')
    expect(questions.find((item) => item.code === 'interview-vue-016-suspense').explanation).toContain('实验性能力')
    expect(questions.find((item) => item.code === 'interview-vue-029-ssr-hydration').explanation).toContain('Vue 3.5+')
    expect(choiceQuestions.every((item) => item.options?.length >= 2)).toBe(true)
    expect(choiceQuestions.every((item) => item.answerKeys.every((key) => item.options.some((option) => option.id === key)))).toBe(true)
    expect(booleanQuestions.every((item) => item.answerKeys.length === 1 && ['true', 'false'].includes(item.answerKeys[0]))).toBe(true)
  })
})
