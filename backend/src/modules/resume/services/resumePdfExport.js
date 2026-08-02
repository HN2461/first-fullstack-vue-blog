import { buildResumeBlocks } from './resumeExportContent.js'
import { buildBossResumePdf } from './bossResumePdf.js'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842

const PDF_TEMPLATES = {
  classic: {
    accent: [0.086, 0.467, 1], body: [0.12, 0.16, 0.23], muted: [0.39, 0.45, 0.55],
    margin: 50, titleSize: 20, headingSize: 13, bodySize: 10, bodyLine: 15, titleAlign: 'left'
  },
  compact: {
    accent: [0.059, 0.463, 0.431], body: [0.1, 0.2, 0.19], muted: [0.36, 0.45, 0.43],
    margin: 42, titleSize: 18, headingSize: 11.5, bodySize: 9, bodyLine: 12.5, titleAlign: 'left'
  },
  executive: {
    accent: [0.486, 0.227, 0.929], body: [0.16, 0.13, 0.24], muted: [0.45, 0.4, 0.52],
    margin: 56, titleSize: 22, headingSize: 13.5, bodySize: 10, bodyLine: 15.5, titleAlign: 'center'
  }
}

function resolveTemplate(templateKey) {
  return PDF_TEMPLATES[templateKey] || PDF_TEMPLATES.classic
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

function estimateTextWidth(value, fontSize) {
  return [...String(value)].reduce((width, char) => {
    const code = char.codePointAt(0)
    if (/\s/.test(char)) return width + fontSize * 0.3
    if (code <= 0x7f) return width + fontSize * 0.55
    return width + fontSize
  }, 0)
}

function wrapText(value, fontSize, maxWidth) {
  const lines = []
  let current = ''
  let width = 0

  for (const char of String(value || '')) {
    if (char === '\n') {
      lines.push(current)
      current = ''
      width = 0
      continue
    }

    const charWidth = estimateTextWidth(char, fontSize)
    if (current && width + charWidth > maxWidth) {
      lines.push(current)
      current = char
      width = charWidth
    } else {
      current += char
      width += charWidth
    }
  }

  if (current || !lines.length) lines.push(current)
  return lines
}

function getBlockLayout(block, template) {
  if (block.type === 'title') {
    return { size: template.titleSize, line: template.titleSize + 7, before: 0, after: 9, color: template.accent, align: template.titleAlign, indent: 0 }
  }
  if (block.type === 'heading') {
    return { size: template.headingSize, line: template.headingSize + 6, before: 8, after: 3, color: template.accent, align: 'left', indent: 0, keepWithNext: true }
  }
  if (block.type === 'meta') {
    return { size: Math.max(8.5, template.bodySize - 1), line: template.bodyLine - 1, before: 0, after: 0, color: template.muted, align: template.titleAlign, indent: 0 }
  }
  if (block.type === 'bullet') {
    const indent = block.level ? 28 : 14
    return { size: template.bodySize, line: template.bodyLine, before: 0, after: 2, color: template.body, align: 'left', indent, prefix: '- ' }
  }
  return { size: template.bodySize, line: template.bodyLine, before: 0, after: 3, color: template.body, align: 'left', indent: 0 }
}

function placeResumeContent(resume, template) {
  const pages = [[]]
  const top = PAGE_HEIGHT - template.margin
  const bottom = template.margin + 14
  let page = pages[0]
  let y = top

  const newPage = () => {
    page = []
    pages.push(page)
    y = top
  }

  for (const block of buildResumeBlocks(resume)) {
    const layout = getBlockLayout(block, template)
    const value = `${layout.prefix || ''}${block.text}`
    const availableWidth = PAGE_WIDTH - template.margin * 2 - layout.indent
    const wrapped = wrapText(value, layout.size, availableWidth)
    const requiredHeight = layout.before + wrapped.length * layout.line + layout.after
    const reserve = layout.keepWithNext ? template.bodyLine * 2 : 0

    if (y - requiredHeight < bottom + reserve && page.length) newPage()
    y -= layout.before

    wrapped.forEach((line, index) => {
      const lineWidth = estimateTextWidth(line, layout.size)
      const x = layout.align === 'center'
        ? Math.max(template.margin, (PAGE_WIDTH - lineWidth) / 2)
        : template.margin + layout.indent
      page.push({ text: line, x, y, size: layout.size, color: layout.color })
      y -= layout.line

      // 超长单块也必须安全跨页，不能因为预估高度大于一页而越过页脚。
      if (y < bottom && index < wrapped.length - 1) newPage()
    })
    y -= layout.after
  }

  return pages
}

function textOperator(item) {
  const color = item.color.map((value) => Number(value).toFixed(3)).join(' ')
  return `BT\n/F1 ${item.size} Tf\n${color} rg\n${item.x.toFixed(2)} ${item.y.toFixed(2)} Td\n<${toUtf16BeHex(item.text)}> Tj\nET`
}

function buildPageStream(items, pageNumber, totalPages, template) {
  const body = items.map(textOperator)
  const footerText = `第 ${pageNumber} / ${totalPages} 页`
  body.push(textOperator({
    text: footerText,
    x: PAGE_WIDTH - template.margin - estimateTextWidth(footerText, 8),
    y: 26,
    size: 8,
    color: template.muted
  }))
  return body.join('\n')
}

function buildPdfObjects(streams) {
  const pageIds = streams.map((_, index) => 6 + index * 2)
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${streams.length} >>`,
    '<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [4 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /FontDescriptor 5 0 R /DW 1000 /W [32 126 500] >>',
    '<< /Type /FontDescriptor /FontName /STSong-Light /Flags 4 /FontBBox [-25 -254 1000 880] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 880 /StemV 80 >>'
  ]

  streams.forEach((stream, index) => {
    const contentId = 7 + index * 2
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`)
    objects.push(`<< /Length ${Buffer.byteLength(stream, 'binary')} >>\nstream\n${stream}\nendstream`)
  })

  return objects
}

function serializePdf(objects) {
  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
  const parts = [header]
  const offsets = [0]
  let offset = Buffer.byteLength(header, 'binary')

  objects.forEach((content, index) => {
    const object = `${index + 1} 0 obj\n${content}\nendobj\n`
    offsets.push(offset)
    parts.push(object)
    offset += Buffer.byteLength(object, 'binary')
  })

  const xrefOffset = offset
  const xrefRows = offsets.map((item, index) => (
    index === 0 ? '0000000000 65535 f ' : `${String(item).padStart(10, '0')} 00000 n `
  )).join('\n')
  parts.push(`xref\n0 ${offsets.length}\n${xrefRows}\ntrailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)
  return Buffer.from(parts.join(''), 'binary')
}

export function buildResumePdf(resume, templateKey = 'classic') {
  if (templateKey === 'boss') return buildBossResumePdf(resume)
  const template = resolveTemplate(templateKey)
  const pages = placeResumeContent(resume, template)
  const streams = pages.map((items, index) => buildPageStream(items, index + 1, pages.length, template))
  return serializePdf(buildPdfObjects(streams))
}
