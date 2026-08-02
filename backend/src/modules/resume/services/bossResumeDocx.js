import { createZip } from '#utils/zipArchive.js'
import { buildBossResumeBlocks } from './resumeExportContent.js'

const PAGE_WIDTH_DXA = 10906

function cleanXmlText(value = '') {
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
}

function escapeXml(value = '') {
  return cleanXmlText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function runXml(text, options = {}) {
  const properties = [
    '<w:rFonts w:ascii="Microsoft YaHei" w:hAnsi="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/>',
    options.bold ? '<w:b/>' : '',
    options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : '',
    options.color ? `<w:color w:val="${options.color}"/>` : ''
  ].join('')
  return `<w:r><w:rPr>${properties}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`
}

function paragraphXml(runs, options = {}) {
  const runList = Array.isArray(runs) ? runs : [runXml(runs)]
  const properties = [
    options.style ? `<w:pStyle w:val="${options.style}"/>` : '',
    options.align ? `<w:jc w:val="${options.align}"/>` : '',
    options.keepNext ? '<w:keepNext/>' : '',
    options.numId ? `<w:numPr><w:ilvl w:val="${options.level || 0}"/><w:numId w:val="${options.numId}"/></w:numPr>` : '',
    options.after !== undefined ? `<w:spacing w:after="${options.after}" w:line="${options.line || 260}" w:lineRule="auto"/>` : '',
    options.borderBottom ? '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="5" w:color="CFCFCF"/></w:pBdr>' : ''
  ].join('')
  return `<w:p><w:pPr>${properties}</w:pPr>${runList.join('')}</w:p>`
}

function cellXml(content, width, options = {}) {
  const verticalAlign = options.verticalAlign || 'center'
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/><w:vAlign w:val="${verticalAlign}"/><w:tcMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tcMar></w:tcPr>${content}</w:tc>`
}

function tableXml(cells, widths) {
  const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join('')
  return `<w:tbl><w:tblPr><w:tblW w:w="${PAGE_WIDTH_DXA}" w:type="dxa"/><w:tblInd w:w="0" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>${cells.join('')}</w:tr></w:tbl>`
}

function imageParagraphXml() {
  return `<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="0"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="971550" cy="1181100"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="1" name="简历证件照"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="resume-photo.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId5"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="971550" cy="1181100"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`
}

function headerXml(blocks, hasPhoto) {
  const name = blocks.find((block) => block.type === 'boss-name')?.text || ''
  const contact = blocks.find((block) => block.type === 'boss-contact')?.text || ''
  const intention = blocks.find((block) => block.type === 'boss-intention')?.text || ''
  const identity = [
    paragraphXml([runXml(name, { bold: true, size: 42 })], { align: 'center', after: 100, line: 300 }),
    paragraphXml([runXml(contact, { size: 20, color: '444444' })], { align: 'center', after: 35, line: 245 }),
    paragraphXml([runXml(intention, { size: 20, color: '444444' })], { align: 'center', after: 0, line: 245 })
  ].join('')
  const photo = hasPhoto ? imageParagraphXml() : paragraphXml('')
  return tableXml([cellXml(identity, 9406), cellXml(photo, 1500)], [9406, 1500])
}

function entryHeaderXml(block) {
  const widths = [6506, 2100, 2300]
  return tableXml([
    cellXml(paragraphXml([runXml(block.title, { bold: true, size: 22 })], { after: 0 }), widths[0]),
    cellXml(paragraphXml([runXml(block.role, { size: 19 })], { after: 0 }), widths[1]),
    cellXml(paragraphXml([runXml(block.range, { size: 19, color: '666666' })], { align: 'right', after: 0 }), widths[2])
  ], widths)
}

function educationXml(block) {
  const widths = [1800, 1200, 5106, 2800]
  return tableXml([
    cellXml(paragraphXml([runXml(block.school, { bold: true, size: 22 })], { after: 0 }), widths[0]),
    cellXml(paragraphXml([runXml(block.degree, { size: 19 })], { after: 0 }), widths[1]),
    cellXml(paragraphXml([runXml(block.major, { size: 19 })], { after: 0 }), widths[2]),
    cellXml(paragraphXml([runXml(block.range, { size: 19, color: '666666' })], { align: 'right', after: 0 }), widths[3])
  ], widths)
}

function contentXml(blocks) {
  const paragraphs = []
  let inProjects = false
  let projectIndex = 0
  for (const block of blocks) {
    if (['boss-name', 'boss-contact', 'boss-intention'].includes(block.type)) continue
    if (block.type === 'boss-section') {
      inProjects = block.text === '项目经历'
      paragraphs.push(paragraphXml([runXml(block.text, { bold: true, size: 30 })], {
        keepNext: true,
        borderBottom: true,
        after: 110,
        line: 300
      }))
      continue
    }
    if (block.type === 'boss-entry') {
      if (inProjects) projectIndex += 1
      paragraphs.push(entryHeaderXml(block))
      continue
    }
    if (block.type === 'boss-numbered') {
      paragraphs.push(paragraphXml([runXml(block.text)], { numId: 7, after: 20, line: 240 }))
      continue
    }
    if (block.type === 'boss-bullet') {
      const runs = block.label
        ? [runXml(`${block.label}：`, { bold: true }), runXml(block.text)]
        : [runXml(block.text)]
      paragraphs.push(paragraphXml(runs, { numId: 1, after: 20, line: 240 }))
      continue
    }
    if (block.type === 'boss-responsibility') {
      const runs = block.title
        ? [runXml(`${block.title}：`, { bold: true }), runXml(block.text)]
        : [runXml(block.text)]
      paragraphs.push(paragraphXml(runs, { numId: projectIndex + 1, after: 20, line: 240 }))
      continue
    }
    if (block.type === 'boss-education') {
      paragraphs.push(educationXml(block))
      if (block.description) paragraphs.push(paragraphXml(block.description, { after: 30 }))
    }
  }
  return paragraphs.join('')
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:hAnsi="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="19"/><w:szCs w:val="19"/><w:color w:val="303030"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="20" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="20" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:hAnsi="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style></w:styles>`
}

function numberingXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="●"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="280"/></w:tabs><w:ind w:left="280" w:hanging="220"/></w:pPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="（%1）"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="520"/></w:tabs><w:ind w:left="520" w:hanging="420"/></w:pPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="2"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="360"/></w:tabs><w:ind w:left="360" w:hanging="260"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num><w:num w:numId="3"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num><w:num w:numId="4"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num><w:num w:numId="5"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num><w:num w:numId="6"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num><w:num w:numId="7"><w:abstractNumId w:val="2"/></w:num></w:numbering>`
}

export function buildBossResumeDocx(resume) {
  const photoBuffer = Buffer.isBuffer(resume.photoBuffer) && resume.photoBuffer[0] === 0xff && resume.photoBuffer[1] === 0xd8
    ? resume.photoBuffer
    : null
  const blocks = buildBossResumeBlocks(resume)
  const body = `${headerXml(blocks, Boolean(photoBuffer))}${contentXml(blocks)}`
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="600" w:right="500" w:bottom="560" w:left="500" w:header="360" w:footer="360"/></w:sectPr></w:body></w:document>`
  const relationships = [
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>',
    photoBuffer ? '<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/resume-photo.jpg"/>' : ''
  ].join('')
  const entries = [
    { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>' },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { name: 'word/document.xml', data: documentXml },
    { name: 'word/styles.xml', data: stylesXml() },
    { name: 'word/numbering.xml', data: numberingXml() },
    { name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships}</Relationships>` }
  ]
  if (photoBuffer) entries.push({ name: 'word/media/resume-photo.jpg', data: photoBuffer })
  return createZip(entries)
}
