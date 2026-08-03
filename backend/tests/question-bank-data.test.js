import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const questionDataDir = path.resolve(testDir, '../src/data/questionBank')

function loadBuiltinQuestionData() {
  const categories = JSON.parse(fs.readFileSync(path.join(questionDataDir, 'categories.json'), 'utf8')).items
  const questions = fs.readdirSync(questionDataDir)
    .filter((fileName) => /^questions-.+\.json$/i.test(fileName))
    .sort()
    .flatMap((fileName) => JSON.parse(fs.readFileSync(path.join(questionDataDir, fileName), 'utf8')).questions)
  return { categories, questions }
}

describe('question bank builtin data', () => {
  it('ships 570 structurally valid and uniquely coded essential questions', () => {
    const { categories, questions } = loadBuiltinQuestionData()
    const categoryKeys = new Set(categories.map((item) => item.key))
    const questionCodes = questions.map((item) => item.code)
    const questionStems = questions.map((item) => item.stem.trim())
    const frontendQuestions = questions.filter((item) => item.categoryKey.startsWith('frontend.'))
    const interviewQuestions = questions.filter((item) => item.categoryKey.startsWith('frontend.interview.'))
    const choiceQuestions = questions.filter((item) => ['single_choice', 'multiple_choice'].includes(item.type))
    const booleanQuestions = questions.filter((item) => item.type === 'true_false')

    expect(categories).toHaveLength(27)
    expect(questions).toHaveLength(570)
    expect(frontendQuestions).toHaveLength(485)
    expect(interviewQuestions).toHaveLength(150)
    expect(new Set(questionCodes).size).toBe(570)
    expect(new Set(questionStems).size).toBe(570)
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
    expect(interviewQuestions.every((item) => item.explanation.trim().length >= 40)).toBe(true)
    expect(choiceQuestions.every((item) => item.options?.length >= 2)).toBe(true)
    expect(choiceQuestions.every((item) => item.answerKeys.every((key) => item.options.some((option) => option.id === key)))).toBe(true)
    expect(booleanQuestions.every((item) => item.answerKeys.length === 1 && ['true', 'false'].includes(item.answerKeys[0]))).toBe(true)
  })
})
