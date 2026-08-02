import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import { buildBossResumeBlocks } from './resumeExportContent.js'

const FONT_PATHS = {
  cjk: {
    regular: fileURLToPath(new URL('../../../assets/fonts/noto-sans-sc/NotoSansSC-CJK-Regular.ttf', import.meta.url)),
    bold: fileURLToPath(new URL('../../../assets/fonts/noto-sans-sc/NotoSansSC-CJK-Bold.ttf', import.meta.url))
  },
  latin: {
    regular: fileURLToPath(new URL('../../../assets/fonts/noto-sans-sc/NotoSansSC-Latin-Regular.ttf', import.meta.url)),
    bold: fileURLToPath(new URL('../../../assets/fonts/noto-sans-sc/NotoSansSC-Latin-Bold.ttf', import.meta.url))
  }
}

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 25
const BOTTOM = 28
const BODY_SIZE = 10
const BODY_LINE = 17.2

function wrapText(value, fontSize, maxWidth, bold, measureText) {
  const lines = []
  let current = ''
  let width = 0
  const tokens = String(value || '').match(/[A-Za-z0-9@._+#/-]+|[\x00-\x7F]|[^\x00-\x7F]/g) || []
  for (const token of tokens) {
    const tokenWidth = measureText(token, fontSize, bold)
    if (current && width + tokenWidth > maxWidth) {
      lines.push(current.trimEnd())
      current = token.trimStart()
      width = measureText(current, fontSize, bold)
    } else {
      current += token
      width += tokenWidth
    }
  }
  if (current || !lines.length) lines.push(current)
  return lines
}

function jpegDimensions(buffer) {
  if (!buffer?.length || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = buffer[offset + 1]
    const length = buffer.readUInt16BE(offset + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) }
    }
    if (!length) break
    offset += length + 2
  }
  return null
}

function layoutBossResume(resume, hasPhoto, measureText) {
  const pages = [[]]
  let page = pages[0]
  let y = PAGE_HEIGHT - 30
  let inProjects = false
  let projectIndex = 0

  const newPage = () => {
    page = []
    pages.push(page)
    y = PAGE_HEIGHT - MARGIN
  }

  const ensure = (height) => {
    if (y - height < BOTTOM && page.length) newPage()
  }

  const addText = (text, x, size = BODY_SIZE, options = {}) => {
    page.push({ type: 'text', text, x, y, size, bold: options.bold === true })
  }

  const addWrapped = (value, options = {}) => {
    const size = options.size || BODY_SIZE
    const x = options.x ?? MARGIN
    const hanging = options.hanging || 0
    const maxWidth = PAGE_WIDTH - MARGIN - x
    const lines = wrapText(value, size, maxWidth, options.bold === true, measureText)
    ensure(lines.length * (options.line || BODY_LINE) + (options.after || 0))
    lines.forEach((line, index) => {
      addText(line, x + (index ? hanging : 0), size, { bold: options.bold })
      y -= options.line || BODY_LINE
      if (y < BOTTOM && index < lines.length - 1) newPage()
    })
    y -= options.after || 0
  }

  for (const block of buildBossResumeBlocks(resume)) {
    if (block.type === 'boss-name') {
      const size = 21
      const width = measureText(block.text, size, true)
      addText(block.text, Math.max(MARGIN, (PAGE_WIDTH - width) / 2), size, { bold: true })
      if (hasPhoto) page.push({ type: 'image', x: 508, y: 744, width: 62, height: 76 })
      y = 772
      continue
    }
    if (block.type === 'boss-contact' || block.type === 'boss-intention') {
      const size = 10
      const width = measureText(block.text, size, false)
      addText(block.text, Math.max(MARGIN, (PAGE_WIDTH - width) / 2), size)
      y -= 18
      continue
    }
    if (block.type === 'boss-section') {
      inProjects = block.text === '项目经历'
      y -= 7
      ensure(42)
      addText(block.text, MARGIN, 15, { bold: true })
      y -= 8
      page.push({ type: 'line', x1: MARGIN, x2: PAGE_WIDTH - MARGIN, y })
      y -= 15
      continue
    }
    if (block.type === 'boss-entry') {
      if (inProjects) {
        projectIndex += 1
        if (projectIndex === 2 && page.length) newPage()
      }
      ensure(58)
      addText(block.title, MARGIN, 11.2, { bold: true })
      const roleX = Math.min(385, MARGIN + measureText(block.title, 11.2, true) + 24)
      if (block.role) addText(block.role, roleX, 9.7)
      if (block.range) addText(block.range, PAGE_WIDTH - MARGIN - measureText(block.range, 9.5, false), 9.5)
      y -= 18
      continue
    }
    if (block.type === 'boss-numbered') {
      addWrapped(`${block.index}. ${block.text}`, { hanging: 13, after: 1 })
      continue
    }
    if (block.type === 'boss-bullet') {
      addWrapped(`● ${block.label ? `${block.label}：` : ''}${block.text}`, { hanging: 13, after: 1 })
      continue
    }
    if (block.type === 'boss-responsibility') {
      addWrapped(`（${block.index}）${block.title ? `${block.title}：` : ''}${block.text}`, { x: MARGIN + 4, hanging: 23, after: 1 })
      continue
    }
    if (block.type === 'boss-education') {
      ensure(35)
      addText(block.school, MARGIN, 11.2, { bold: true })
      if (block.degree) addText(block.degree, 110, 9.8)
      if (block.major) addText(block.major, 165, 9.8)
      if (block.range) addText(block.range, PAGE_WIDTH - MARGIN - measureText(block.range, 9.5, false), 9.5)
      y -= 17
      if (block.description) addWrapped(block.description, { after: 2 })
    }
  }

  return pages
}

function splitFontRuns(value) {
  const runs = []
  for (const char of String(value)) {
    const font = char === '●' ? 'symbol' : (char.codePointAt(0) <= 0x7f ? 'ascii' : 'cjk')
    const text = char === '●' ? '•' : char
    const current = runs.at(-1)
    if (current?.font === font) current.text += text
    else runs.push({ font, text })
  }
  return runs
}

function fontName(run, bold) {
  if (run.font === 'symbol') return bold ? 'Helvetica-Bold' : 'Helvetica'
  const family = run.font === 'ascii' ? 'Latin' : 'Cjk'
  return `${family}${bold ? 'Bold' : 'Regular'}`
}

function registerFonts(doc) {
  doc.registerFont('CjkRegular', FONT_PATHS.cjk.regular)
  doc.registerFont('CjkBold', FONT_PATHS.cjk.bold)
  doc.registerFont('LatinRegular', FONT_PATHS.latin.regular)
  doc.registerFont('LatinBold', FONT_PATHS.latin.bold)
}

function createTextMeasurer(doc) {
  return (value, size, bold = false) => splitFontRuns(value).reduce((width, run) => {
    doc.font(fontName(run, bold)).fontSize(size)
    return width + doc.widthOfString(run.text, { characterSpacing: 0 })
  }, 0)
}

function drawText(doc, item, measureText) {
  let x = item.x
  for (const run of splitFontRuns(item.text)) {
    if (run.font === 'symbol') {
      doc
        .save()
        .fillColor('#202020')
        .circle(x + item.size * 0.24, PAGE_HEIGHT - item.y - item.size * 0.38, item.size * 0.22)
        .fill()
        .restore()
      x += measureText(run.text, item.size, item.bold)
      continue
    }
    doc
      .font(fontName(run, item.bold))
      .fontSize(item.size)
      .fillColor('#202020')
      .text(run.text, x, PAGE_HEIGHT - item.y - item.size * 0.88, { lineBreak: false })
    x += measureText(run.text, item.size, item.bold)
  }
}

function drawPage(doc, items, photoBuffer, measureText) {
  doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT], margins: 0 })
  for (const item of items) {
    if (item.type === 'line') {
      doc
        .save()
        .strokeColor('#c7c7c7')
        .lineWidth(0.5)
        .moveTo(item.x1, PAGE_HEIGHT - item.y)
        .lineTo(item.x2, PAGE_HEIGHT - item.y)
        .stroke()
        .restore()
      continue
    }
    if (item.type === 'image') {
      doc.image(photoBuffer, item.x, PAGE_HEIGHT - item.y - item.height, {
        width: item.width,
        height: item.height
      })
      continue
    }
    drawText(doc, item, measureText)
  }
}

export function buildBossResumePdf(resume) {
  const photoBuffer = Buffer.isBuffer(resume.photoBuffer) ? resume.photoBuffer : null
  const dimensions = jpegDimensions(photoBuffer)
  const doc = new PDFDocument({ autoFirstPage: false, compress: true, info: { Title: resume.title || 'Boss 简历' } })
  registerFonts(doc)
  const measureText = createTextMeasurer(doc)
  const pages = layoutBossResume(resume, Boolean(dimensions), measureText)

  return new Promise((resolve, reject) => {
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('error', reject)
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    pages.forEach((items) => drawPage(doc, items, photoBuffer, measureText))
    doc.end()
  })
}
