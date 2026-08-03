import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'
import { connectDatabase } from '#config/database'
import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionAttempt } from '#modules/questionBank/models/QuestionAttempt.js'
import { QuestionCategory } from '#modules/questionBank/models/QuestionCategory.js'
import { QuestionPaper } from '#modules/questionBank/models/QuestionPaper.js'
import { QuestionProgress } from '#modules/questionBank/models/QuestionProgress.js'

const apply = process.argv.includes('--apply')
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(scriptDir, '../data/questionBank')

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'))
}

function loadQuestionFiles() {
  return fs.readdirSync(dataDir)
    .filter((fileName) => /^questions-.+\.json$/i.test(fileName))
    .sort()
    .flatMap((fileName) => {
      const payload = readJson(fileName)
      if (payload.schemaVersion !== 1 || !Array.isArray(payload.questions)) {
        throw new Error(`题库数据格式不正确：${fileName}`)
      }
      return payload.questions.map((item) => ({ ...item, sourceFile: fileName }))
    })
}

async function ensureQuestionBankIndexes() {
  await Promise.all([
    QuestionCategory.createIndexes(),
    Question.createIndexes(),
    QuestionPaper.createIndexes(),
    QuestionAttempt.createIndexes(),
    QuestionProgress.createIndexes()
  ])
}

async function seedCategories(items) {
  const categoryMap = new Map()
  let created = 0
  let updated = 0
  let unchanged = 0
  for (const input of items) {
    const parent = input.parentKey ? categoryMap.get(input.parentKey) : null
    if (input.parentKey && !parent) throw new Error(`找不到上级分类：${input.parentKey}`)
    const existing = await QuestionCategory.findOne({ key: input.key })
    const data = {
      name: input.name,
      parentId: parent?._id || null,
      ancestors: parent ? [...parent.ancestors, parent._id] : [],
      pathNames: parent ? [...parent.pathNames, input.name] : [input.name],
      level: parent ? parent.level + 1 : 1,
      sortOrder: input.sortOrder || 0
    }
    const changed = existing && (
      String(existing.parentId || '') !== String(data.parentId || '') ||
      existing.name !== data.name ||
      existing.level !== data.level ||
      existing.sortOrder !== data.sortOrder ||
      JSON.stringify((existing.ancestors || []).map(String)) !== JSON.stringify(data.ancestors.map(String)) ||
      JSON.stringify(existing.pathNames || []) !== JSON.stringify(data.pathNames)
    )
    if (apply) {
      let category = existing
      if (!existing) {
        category = await QuestionCategory.create({ ...data, key: input.key, enabled: true })
      } else if (changed) {
        category = await QuestionCategory.findByIdAndUpdate(existing._id, { $set: data }, { new: true })
      }
      categoryMap.set(input.key, category)
    } else {
      categoryMap.set(input.key, {
        _id: existing?._id || new mongoose.Types.ObjectId(),
        ancestors: data.ancestors,
        pathNames: data.pathNames,
        level: data.level
      })
    }
    if (!existing) created += 1
    else if (changed) updated += 1
    else unchanged += 1
  }
  return { categoryMap, created, updated, unchanged }
}

async function seedQuestions(items, categoryMap) {
  let created = 0
  let updated = 0
  let unchanged = 0
  for (const input of items) {
    const category = categoryMap.get(input.categoryKey)
    if (!category) throw new Error(`题目 ${input.code} 的分类不存在：${input.categoryKey}`)
    const existing = await Question.findOne({ code: input.code }).select('_id contentHash')
    const contentHash = crypto.createHash('sha256').update(JSON.stringify({
      categoryKey: input.categoryKey,
      type: input.type,
      assessmentMode: input.assessmentMode,
      stem: input.stem,
      options: input.options || [],
      answerKeys: (input.answerKeys || []).map(String),
      explanation: input.explanation || '',
      difficulty: input.difficulty || 'medium',
      tags: input.tags || []
    })).digest('hex')
    const data = {
      categoryId: category._id,
      type: input.type,
      assessmentMode: input.assessmentMode || 'auto',
      stem: input.stem,
      options: input.options || [],
      answerKeys: (input.answerKeys || []).map(String),
      explanation: input.explanation || '',
      difficulty: input.difficulty || 'medium',
      tags: input.tags || [],
      source: `builtin-essential-v1:${input.sourceFile}`,
      contentHash,
      defaultScore: 1,
      createdBy: null
    }
    if (apply) {
      if (!existing) {
        await Question.create({ ...data, code: input.code, version: 1, status: 'ready' })
      } else if (existing.contentHash !== contentHash) {
        await Question.updateOne(
          { _id: existing._id },
          { $set: data, $inc: { version: 1 } },
          { runValidators: true }
        )
      }
    }
    if (!existing) created += 1
    else if (existing.contentHash !== contentHash) updated += 1
    else unchanged += 1
  }
  return { created, updated, unchanged }
}

async function seedPapers(items, categoryMap) {
  let created = 0
  let updated = 0
  let unchanged = 0
  for (const input of items) {
    const categoryIds = input.categoryKeys.map((key) => {
      const category = categoryMap.get(key)
      if (!category) throw new Error(`试卷 ${input.key} 的分类不存在：${key}`)
      return category._id
    })
    const data = {
      title: input.title,
      description: input.description || '系统内置随机试卷。每次开始考试时按当前题库动态抽题，历史答卷仍保留当次题目快照。',
      mode: 'random',
      questionIds: [],
      filters: {
        categoryIds,
        tags: input.tags || [],
        types: input.types || [],
        difficulties: input.difficulties || []
      },
      questionCount: input.questionCount,
      durationMinutes: input.durationMinutes,
      passScore: input.passScore ?? 70,
      shuffleQuestions: true,
      status: 'ready',
      createdBy: null,
      source: 'builtin-essential-v1:papers.json'
    }
    const existing = await QuestionPaper.findOne({ key: input.key })
    const current = existing?.toObject()
    const changed = existing && (
      current.title !== data.title ||
      current.description !== data.description ||
      current.mode !== data.mode ||
      current.questionCount !== data.questionCount ||
      current.durationMinutes !== data.durationMinutes ||
      current.passScore !== data.passScore ||
      current.shuffleQuestions !== data.shuffleQuestions ||
      current.status !== data.status ||
      current.source !== data.source ||
      JSON.stringify((current.filters?.categoryIds || []).map(String)) !== JSON.stringify(categoryIds.map(String)) ||
      JSON.stringify(current.filters?.tags || []) !== JSON.stringify(data.filters.tags) ||
      JSON.stringify(current.filters?.types || []) !== JSON.stringify(data.filters.types) ||
      JSON.stringify(current.filters?.difficulties || []) !== JSON.stringify(data.filters.difficulties)
    )
    if (apply) {
      if (!existing) await QuestionPaper.create({ ...data, key: input.key })
      else if (changed) await QuestionPaper.updateOne({ _id: existing._id }, { $set: data }, { runValidators: true })
    }
    if (!existing) created += 1
    else if (changed) updated += 1
    else unchanged += 1
  }
  return { created, updated, unchanged }
}

async function main() {
  await connectDatabase()
  const categoryPayload = readJson('categories.json')
  const paperPayload = readJson('papers.json')
  const questions = loadQuestionFiles()
  const duplicateCodes = questions.filter((item, index) => questions.findIndex((candidate) => candidate.code === item.code) !== index)
  if (duplicateCodes.length) throw new Error(`存在重复题目编码：${duplicateCodes.map((item) => item.code).join(', ')}`)

  console.log(`MODE=${apply ? 'APPLY' : 'DRY_RUN'}`)
  console.log(`SOURCE_CATEGORIES=${categoryPayload.items.length}`)
  console.log(`SOURCE_QUESTIONS=${questions.length}`)
  console.log(`SOURCE_PAPERS=${paperPayload.items.length}`)
  const categoryResult = await seedCategories(categoryPayload.items)
  const questionResult = await seedQuestions(questions, categoryResult.categoryMap)
  const paperResult = await seedPapers(paperPayload.items, categoryResult.categoryMap)
  console.log(`CATEGORIES_CREATE=${categoryResult.created}`)
  console.log(`CATEGORIES_UPDATE=${categoryResult.updated}`)
  console.log(`CATEGORIES_UNCHANGED=${categoryResult.unchanged}`)
  console.log(`QUESTIONS_CREATE=${questionResult.created}`)
  console.log(`QUESTIONS_UPDATE=${questionResult.updated}`)
  console.log(`QUESTIONS_UNCHANGED=${questionResult.unchanged}`)
  console.log(`PAPERS_CREATE=${paperResult.created}`)
  console.log(`PAPERS_UPDATE=${paperResult.updated}`)
  console.log(`PAPERS_UNCHANGED=${paperResult.unchanged}`)
  if (apply) {
    await ensureQuestionBankIndexes()
    console.log('题库数据已写入，索引已确认。')
  } else {
    console.log('当前为 dry-run，未写入数据库。传入 --apply 后执行导入。')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
