import { ResumeExportRecord } from '#modules/resume/models/ResumeExportRecord.js'
import { createZip } from '#utils/zipArchive.js'
import { findOwnedResume } from './resume.service.js'
import { assertObjectId, createResumeError, formatCompactDate, safeFilename } from './resume.utils.js'

const FORMAT_META = {
  markdown: { ext: 'md', contentType: 'text/markdown; charset=utf-8' },
  pdf: { ext: 'pdf', contentType: 'application/pdf' },
  word: {
    ext: 'docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function normalizeText(value = '') {
  return String(value || '').trim()
}

function sectionLines(resume) {
  const sections = resume.sections || {}
  const profile = sections.profile || {}
  const lines = [
    `# ${resume.title}`,
    '',
    `目标岗位：${resume.targetRole || '-'}`,
    `姓名：${profile.name || '-'}`,
    `电话：${profile.phone || '-'}`,
    `邮箱：${profile.email || '-'}`,
    `所在地：${profile.location || '-'}`,
    profile.website ? `个人链接：${profile.website}` : '',
    '',
    '## 基础信息',
    profile.summary || '暂无个人简介'
  ].filter((line) => line !== '')

  appendSkillLines(lines, sections.skills || [])
  appendEducationLines(lines, sections.education || [])
  appendWorkLines(lines, sections.workExperiences || [])
  appendProjectLines(lines, sections.projects || [])
  appendEvaluationLines(lines, sections.selfEvaluation || [])
  return lines
}

function appendSkillLines(lines, items) {
  lines.push('', '## 专业技能')
  if (!items.length) lines.push('- 暂无')
  for (const item of items) {
    lines.push(`- ${item.name || '未命名技能'}${item.level ? `（${item.level}）` : ''}`)
    if (item.description) lines.push(`  - ${item.description}`)
  }
}

function appendEducationLines(lines, items) {
  lines.push('', '## 教育经历')
  if (!items.length) lines.push('- 暂无')
  for (const item of items) {
    lines.push(`- ${item.school || '学校'} ${item.major || ''} ${item.degree || ''}`.trim())
    lines.push(`  - ${item.startDate || '-'} 至 ${item.endDate || '至今'}`)
    if (item.description) lines.push(`  - ${item.description}`)
  }
}

function appendWorkLines(lines, items) {
  lines.push('', '## 工作经历')
  if (!items.length) lines.push('- 暂无')
  for (const item of items) {
    lines.push(`- ${item.company || '公司'} / ${item.role || '职位'}`)
    lines.push(`  - ${item.startDate || '-'} 至 ${item.endDate || '至今'}`)
    if (item.description) lines.push(`  - ${item.description}`)
    for (const achievement of item.achievements || []) {
      lines.push(`  - ${achievement.content}`)
    }
  }
}

function appendProjectLines(lines, items) {
  lines.push('', '## 项目经历')
  if (!items.length) lines.push('- 暂无')
  for (const item of items) {
    lines.push(`- ${item.name || '项目'} / ${item.role || '角色'}`)
    if (item.techStack) lines.push(`  - 技术栈：${item.techStack}`)
    if (item.description) lines.push(`  - ${item.description}`)
    for (const highlight of item.highlights || []) {
      lines.push(`  - ${highlight.content}`)
    }
  }
}

function appendEvaluationLines(lines, items) {
  lines.push('', '## 自我评价')
  if (!items.length) lines.push('- 暂无')
  for (const item of items) {
    lines.push(`- ${item.content}`)
  }
}

function buildMarkdown(resume) {
  return `${sectionLines(resume).join('\n')}\n`
}

function buildDocx(resume) {
  const paragraphs = sectionLines(resume)
    .map((line) => {
      const style = line.startsWith('# ')
        ? '<w:pStyle w:val="Title"/>'
        : line.startsWith('## ')
          ? '<w:pStyle w:val="Heading1"/>'
          : ''
      const text = line.replace(/^#{1,2}\s*/, '')
      return `<w:p><w:pPr>${style}</w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
    })
    .join('')
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`

  return createZip([
    {
      name: '[Content_Types].xml',
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
    },
    {
      name: '_rels/.rels',
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
    },
    { name: 'word/document.xml', data: documentXml }
  ])
}

function toUtf16BeHex(value = '') {
  const littleEndian = Buffer.from(String(value), 'utf16le')
  const bigEndian = Buffer.alloc(littleEndian.length)
  for (let index = 0; index < littleEndian.length; index += 2) {
    bigEndian[index] = littleEndian[index + 1]
    bigEndian[index + 1] = littleEndian[index]
  }
  return bigEndian.toString('hex').toUpperCase()
}

function buildPdf(resume) {
  const contentLines = sectionLines(resume).slice(0, 42)
  const textOps = ['BT', '/F1 11 Tf', '50 790 Td', '14 TL']
  contentLines.forEach((line, index) => {
    if (index > 0) textOps.push('T*')
    textOps.push(`<${toUtf16BeHex(line)}> Tj`)
  })
  textOps.push('ET')
  const stream = textOps.join('\n')
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [6 0 R] >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '6 0 obj\n<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /DW 1000 >>\nendobj\n'
  ]
  let offset = Buffer.byteLength('%PDF-1.4\n')
  const offsets = [0]
  const body = objects.map((object) => {
    offsets.push(offset)
    offset += Buffer.byteLength(object)
    return object
  }).join('')
  const xrefOffset = offset
  const xrefRows = offsets
    .map((item, index) => index === 0 ? '0000000000 65535 f ' : `${String(item).padStart(10, '0')} 00000 n `)
    .join('\n')
  const trailer = `xref\n0 ${offsets.length}\n${xrefRows}\ntrailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(`%PDF-1.4\n${body}${trailer}`, 'binary')
}

async function buildExportFile(resume, format) {
  if (format === 'word') return buildDocx(resume)
  if (format === 'pdf') return buildPdf(resume)
  return Buffer.from(buildMarkdown(resume), 'utf8')
}

export async function createResumeExport(userId, input) {
  const resume = await findOwnedResume(input.resumeId, userId)
  const format = input.format
  const meta = FORMAT_META[format]
  const fileData = await buildExportFile(resume.toSafeJSON(), format)
  const filename = `${safeFilename(resume.title)}-${formatCompactDate()}.${meta.ext}`

  const record = await ResumeExportRecord.create({
    ownerId: userId,
    resumeId: resume._id,
    resumeTitle: resume.title,
    format,
    templateKey: input.templateKey || resume.templateKey || 'classic',
    filename,
    contentType: meta.contentType,
    fileData,
    fileSize: fileData.length
  })

  return record.toSafeJSON()
}

export async function listResumeExports(userId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 10))
  const query = { ownerId: userId }
  if (filters.resumeId) query.resumeId = filters.resumeId
  if (filters.format && filters.format !== 'all') query.format = filters.format

  const [items, total] = await Promise.all([
    ResumeExportRecord.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ResumeExportRecord.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function getResumeExportFile(id, userId) {
  assertObjectId(id, 'RESUME_EXPORT_NOT_FOUND', '导出记录不存在')
  const record = await ResumeExportRecord.findOne({ _id: id, ownerId: userId })
  if (!record) {
    throw createResumeError(404, 'RESUME_EXPORT_NOT_FOUND', '导出记录不存在')
  }

  return {
    ...record.toSafeJSON(),
    fileData: record.fileData
  }
}
