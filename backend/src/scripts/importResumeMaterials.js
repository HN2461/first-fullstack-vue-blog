import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDatabase, disconnectDatabase } from '#config/database'
import { User } from '#modules/user/models/User.js'
import { Resume } from '#modules/resume/models/Resume.js'
import { normalizeSections } from '#modules/resume/services/resume.utils.js'
import { upsertResumeMaterial } from '#modules/resume/services/resumeMaterial.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const snapshotPath = path.resolve(__dirname, '../data/resumeMaterials/hn246-resume-materials.json')
const textExtensions = new Set(['.md', '.html', '.txt'])

function getArg(name, fallback = '') {
  const prefix = `${name}=`
  const value = process.argv.find((item) => item.startsWith(prefix))
  return value ? value.slice(prefix.length) : fallback
}

function hasFlag(name) {
  return process.argv.includes(name)
}

function toSlashPath(value) {
  return value.split(path.sep).join('/')
}

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function compactText(value = '') {
  return String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildExcerpt(content) {
  return compactText(content).slice(0, 500)
}

function inferCategory(relativePath) {
  const parts = relativePath.split('/')
  const matched = parts.find((part) => /^\d{2}-/.test(part))
  if (matched) return matched.replace(/^\d{2}-/, '')
  return parts.length > 1 ? parts[0] : '根目录资料'
}

function inferTags(relativePath) {
  return relativePath
    .split('/')
    .slice(0, -1)
    .map((part) => part.replace(/^\d{2}-/, '').replace(/[（）()]/g, '').trim())
    .filter(Boolean)
    .slice(0, 8)
}

async function walkTextFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkTextFiles(rootDir, fullPath))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (!textExtensions.has(ext)) continue

    const content = await fs.readFile(fullPath, 'utf8')
    const relativePath = toSlashPath(path.relative(rootDir, fullPath))
    files.push({
      relativePath,
      title: path.basename(entry.name, ext),
      format: ext === '.html' ? 'html' : ext === '.txt' ? 'text' : 'markdown',
      category: inferCategory(relativePath),
      tags: inferTags(relativePath),
      content,
      excerpt: buildExcerpt(content),
      checksum: hashContent(content),
      fileSize: Buffer.byteLength(content, 'utf8')
    })
  }

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath, 'zh-Hans-CN'))
}

async function loadSnapshot() {
  const raw = await fs.readFile(snapshotPath, 'utf8')
  return JSON.parse(raw)
}

function pickNumberedItems(block = '') {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+[.、]/.test(line))
    .map((line) => line.replace(/^\d+[.、]\s*/, '').trim())
    .filter(Boolean)
}

function extractDirectResume(markdown = '') {
  const match = markdown.match(/## 可直接复制版[\s\S]*?```text\s*([\s\S]*?)```/)
  return match?.[1]?.trim() || ''
}

function parseRange(value = '') {
  const match = value.match(/(\d{4}[.年-]?\d{0,2})\s*[-至]\s*(\d{4}[.年-]?\d{0,2}|至今)/)
  return {
    startDate: match?.[1]?.replace('年', '.') || '',
    endDate: match?.[2]?.replace('年', '.') || ''
  }
}

function parseResumeProject(block, index) {
  const name = block.match(/项目名称：(.+)/)?.[1]?.trim() || `项目经历 ${index + 1}`
  const time = block.match(/项目时间：(.+)/)?.[1]?.trim() || ''
  const techStack = block.match(/技术栈：(.+)/)?.[1]?.trim() || ''
  const description = block.match(/项目描述：(.+)/)?.[1]?.trim() || ''
  const highlights = pickNumberedItems(block.split('职责亮点：')[1] || '')
  const range = parseRange(time)

  return {
    id: `imported-project-${index + 1}`,
    name,
    role: '前端开发工程师',
    techStack,
    startDate: range.startDate,
    endDate: range.endDate,
    description,
    highlights: highlights.map((content, itemIndex) => ({
      id: `imported-project-${index + 1}-highlight-${itemIndex + 1}`,
      content: content.slice(0, 500),
      sortOrder: itemIndex * 10
    })),
    sortOrder: index * 10
  }
}

function buildResumeFromMarkdown(markdown) {
  const direct = extractDirectResume(markdown)
  const lines = direct.split('\n').map((line) => line.trim()).filter(Boolean)
  const [name = '陈浩南'] = (lines[0] || '').split('|').map((item) => item.trim())
  const [phone = '', email = '', location = ''] = (lines[1] || '').split('|').map((item) => item.trim())
  const targetRole = (lines.find((line) => line.startsWith('求职方向：')) || '')
    .replace('求职方向：', '')
    .trim()
  const advantageBlock = (direct.match(/个人优势([\s\S]*?)工作经历/) || [])[1] || ''
  const advantages = pickNumberedItems(advantageBlock)
  const workBlock = (direct.match(/工作经历([\s\S]*?)项目经历/) || [])[1] || ''
  const workLines = workBlock.split('\n').map((line) => line.trim()).filter(Boolean)
  const [company = '', role = '', time = ''] = (workLines[0] || '').split('|').map((item) => item.trim())
  const projectArea = (direct.match(/项目经历([\s\S]*?)教育经历/) || [])[1] || ''
  const projects = projectArea
    .split(/(?=项目名称：)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(parseResumeProject)
  const eduLine = ((direct.match(/教育经历\s*([\s\S]*)/) || [])[1] || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean) || ''
  const [school = '', major = '', degree = '', eduTime = ''] = eduLine.split('|').map((item) => item.trim())

  return {
    title: 'Boss直聘简历-前端开发工程师-2026版',
    targetRole: targetRole || '前端开发工程师',
    templateKey: 'classic',
    status: 'active',
    sections: normalizeSections({
      profile: {
        name,
        phone,
        email,
        location,
        summary: advantages.join('\n')
      },
      skills: [
        { id: 'imported-skill-1', name: 'Vue 3 / JavaScript / ES6+', level: '熟悉', description: advantages[0] || '', sortOrder: 10 },
        { id: 'imported-skill-2', name: 'uni-app / 小程序 / H5', level: '项目经验', description: advantages[1] || '', sortOrder: 20 },
        { id: 'imported-skill-3', name: '复杂业务前端链路', level: '项目经验', description: advantages[3] || '', sortOrder: 30 },
        { id: 'imported-skill-4', name: '平台配置与权限适配', level: '项目经验', description: advantages[2] || '', sortOrder: 40 }
      ],
      education: [{
        id: 'imported-education-1',
        school,
        major,
        degree,
        ...parseRange(eduTime),
        sortOrder: 10
      }],
      workExperiences: [{
        id: 'imported-work-1',
        company,
        role,
        ...parseRange(time),
        description: '持续参与 Uni-app / 小程序 / H5 和 Vue PC 中后台项目开发。',
        achievements: pickNumberedItems(workBlock).map((content, index) => ({
          id: `imported-work-achievement-${index + 1}`,
          content: content.slice(0, 500),
          sortOrder: index * 10
        })),
        sortOrder: 10
      }],
      projects,
      selfEvaluation: advantages.map((content, index) => ({
        id: `imported-evaluation-${index + 1}`,
        content: content.slice(0, 500),
        sortOrder: index * 10
      }))
    })
  }
}

async function importStructuredResume(ownerId, materials, apply) {
  const source = materials.find((item) => item.relativePath === 'Boss直聘简历-前端开发工程师-2026版.md')
  if (!source) return { skipped: true }

  const payload = buildResumeFromMarkdown(source.content)
  if (!apply) {
    return { title: payload.title, projects: payload.sections.projects.length, skipped: false }
  }

  const resume = await Resume.findOneAndUpdate(
    { ownerId, title: payload.title },
    { $set: { ...payload, ownerId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  return { id: resume._id.toString(), title: resume.title, projects: resume.sections.projects.length, skipped: false }
}

async function main() {
  const apply = hasFlag('--apply')
  const writeSnapshot = hasFlag('--write-snapshot')
  const ownerEmail = getArg('--owner-email', process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase()
  const sourceFolder = getArg('--source-folder')
  const snapshot = sourceFolder
    ? {
        schemaVersion: 1,
        source: 'hn246-local-resume-folder',
        generatedAt: new Date().toISOString(),
        materials: await walkTextFiles(path.resolve(sourceFolder))
      }
    : await loadSnapshot()

  if (writeSnapshot) {
    await fs.mkdir(path.dirname(snapshotPath), { recursive: true })
    await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
    console.log(`已刷新快照：${snapshotPath}`)
  }

  await connectDatabase()
  try {
    const owner = await User.findOne({ email: ownerEmail })
    if (!owner) {
      throw new Error(`未找到导入目标用户：${ownerEmail}`)
    }

    const resumeResult = await importStructuredResume(owner._id, snapshot.materials || [], apply)
    let materialCount = 0
    for (const item of snapshot.materials || []) {
      materialCount += 1
      if (!apply) continue
      await upsertResumeMaterial(owner._id, {
        ...item,
        sourceKey: `hn246-resume-folder:${item.relativePath}`
      })
    }

    console.log(JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      ownerEmail,
      materials: materialCount,
      resume: resumeResult
    }, null, 2))
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
