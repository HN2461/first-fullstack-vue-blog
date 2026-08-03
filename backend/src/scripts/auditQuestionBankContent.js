import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(scriptDir, '../data/questionBank')
const categories = JSON.parse(fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf8')).items
const categoryKeys = new Set(categories.map((item) => item.key))
const files = fs.readdirSync(dataDir).filter((name) => /^questions-.+\.json$/i.test(name)).sort()
const questions = files.flatMap((fileName) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'))
  return data.questions.map((question) => ({ ...question, fileName }))
})

const issues = []
const addIssue = (level, question, message) => issues.push({
  level,
  code: question.code || '(missing)',
  file: question.fileName,
  message
})

for (const question of questions) {
  if (!question.code?.trim()) addIssue('error', question, '缺少题目编码')
  if (!categoryKeys.has(question.categoryKey)) addIssue('error', question, `分类不存在：${question.categoryKey}`)
  if (!question.stem?.trim()) addIssue('error', question, '题干为空')
  if (!question.answerKeys?.length) addIssue('error', question, '答案为空')
  if (!question.explanation?.trim()) addIssue('error', question, '解析为空')
  if (question.explanation?.length > 12000) addIssue('error', question, '解析超过 12000 字段限制')

  const isChoice = ['single_choice', 'multiple_choice'].includes(question.type)
  if (isChoice) {
    const optionIds = question.options?.map((item) => item.id) || []
    const optionContents = question.options?.map((item) => item.content.trim()) || []
    if (optionIds.length < 2) addIssue('error', question, '选择题少于两个选项')
    if (new Set(optionIds).size !== optionIds.length) addIssue('error', question, '选项 ID 重复')
    if (new Set(optionContents).size !== optionContents.length) addIssue('error', question, '选项内容重复')
    if (question.answerKeys.some((key) => !optionIds.includes(key))) addIssue('error', question, '答案键未对应任何选项')
    if (question.type === 'single_choice' && question.answerKeys.length !== 1) addIssue('error', question, '单选题答案数量不是 1')
    if (question.type === 'multiple_choice' && question.answerKeys.length < 2) addIssue('warning', question, '多选题只有一个答案，请人工复核题型')
  }

  if (question.type === 'true_false') {
    if (question.answerKeys.length !== 1 || !['true', 'false'].includes(question.answerKeys[0])) {
      addIssue('error', question, '判断题答案必须是 true 或 false')
    }
  }

  if (question.categoryKey.startsWith('frontend.')) {
    const minimum = question.categoryKey.startsWith('frontend.interview.') ? 420 : 300
    if (question.explanation.length < minimum) addIssue('error', question, `前端解析少于质量门槛 ${minimum} 字`)
    for (const heading of ['**答案与结论**', '**小白理解与核心原理**', '**项目实践与排错**', '**常见误区与面试追问**']) {
      if (!question.explanation.includes(heading)) addIssue('error', question, `解析缺少分段：${heading}`)
    }
    if (isChoice && !question.explanation.includes('**逐项分析**')) addIssue('error', question, '选择题解析缺少逐项分析')
  }
  if (/待补充|TODO|暂无解析|略$/.test(question.explanation || '')) addIssue('error', question, '包含占位解析')
}

const duplicateCodes = questions.map((item) => item.code).filter((code, index, all) => all.indexOf(code) !== index)
const duplicateStems = questions.map((item) => item.stem?.trim()).filter((stem, index, all) => all.indexOf(stem) !== index)
for (const code of new Set(duplicateCodes)) issues.push({ level: 'error', code, file: '-', message: '题目编码重复' })
for (const stem of new Set(duplicateStems)) issues.push({ level: 'error', code: '-', file: '-', message: `题干重复：${stem}` })

const frontend = questions.filter((item) => item.categoryKey.startsWith('frontend.'))
const grouped = frontend.reduce((result, item) => {
  if (!result[item.categoryKey]) result[item.categoryKey] = []
  result[item.categoryKey].push(item)
  return result
}, {})
console.log(`题库总数：${questions.length}；前端题：${frontend.length}；分类：${categories.length}`)
for (const [category, items] of Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))) {
  const average = Math.round(items.reduce((sum, item) => sum + item.explanation.length, 0) / items.length)
  const minimum = Math.min(...items.map((item) => item.explanation.length))
  console.log(`${category}: ${items.length} 道，解析平均 ${average} 字，最短 ${minimum} 字`)
}

for (const issue of issues) console.log(`[${issue.level.toUpperCase()}] ${issue.code} ${issue.file}: ${issue.message}`)
const errors = issues.filter((item) => item.level === 'error')
const warnings = issues.filter((item) => item.level === 'warning')
console.log(`审计结果：${errors.length} 个错误，${warnings.length} 个警告`)
if (errors.length) process.exitCode = 1
