import { createZip } from '#utils/zipArchive.js'
import { buildResumeBlocks } from './resumeExportContent.js'
import { buildBossResumeDocx } from './bossResumeDocx.js'

const DOCX_TEMPLATES = {
  classic: {
    accent: '1677FF', font: 'Calibri', eastAsiaFont: 'Microsoft YaHei', bodySize: 21,
    titleSize: 38, headingSize: 27, pageMargin: 1080, bodyAfter: 80, line: 276, titleAlign: 'left'
  },
  compact: {
    accent: '0F766E', font: 'Arial', eastAsiaFont: 'Microsoft YaHei', bodySize: 19,
    titleSize: 34, headingSize: 24, pageMargin: 850, bodyAfter: 45, line: 248, titleAlign: 'left'
  },
  executive: {
    accent: '7C3AED', font: 'Cambria', eastAsiaFont: 'Microsoft YaHei', bodySize: 21,
    titleSize: 42, headingSize: 28, pageMargin: 1134, bodyAfter: 90, line: 286, titleAlign: 'center'
  }
}

function resolveTemplate(templateKey) {
  return DOCX_TEMPLATES[templateKey] || DOCX_TEMPLATES.classic
}

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

function paragraphXml(block) {
  const value = escapeXml(block.text)
  if (block.type === 'bullet') {
    return `<w:p><w:pPr><w:pStyle w:val="ResumeList"/><w:numPr><w:ilvl w:val="${block.level || 0}"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${value}</w:t></w:r></w:p>`
  }

  const styleMap = {
    title: 'Title',
    meta: 'ResumeMeta',
    heading: 'Heading1',
    body: 'Normal'
  }
  return `<w:p><w:pPr><w:pStyle w:val="${styleMap[block.type] || 'Normal'}"/></w:pPr><w:r><w:t xml:space="preserve">${value}</w:t></w:r></w:p>`
}

function buildStylesXml(template) {
  const fonts = `<w:rFonts w:ascii="${template.font}" w:hAnsi="${template.font}" w:eastAsia="${template.eastAsiaFont}"/>`
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr>${fonts}<w:sz w:val="${template.bodySize}"/><w:szCs w:val="${template.bodySize}"/><w:color w:val="1F2937"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="${template.bodyAfter}" w:line="${template.line}" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="${template.bodyAfter}" w:line="${template.line}" w:lineRule="auto"/></w:pPr><w:rPr>${fonts}<w:sz w:val="${template.bodySize}"/><w:szCs w:val="${template.bodySize}"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Resume Title"/><w:basedOn w:val="Normal"/><w:next w:val="ResumeMeta"/><w:qFormat/><w:pPr><w:jc w:val="${template.titleAlign}"/><w:spacing w:before="0" w:after="160"/><w:keepNext/></w:pPr><w:rPr>${fonts}<w:b/><w:color w:val="${template.accent}"/><w:sz w:val="${template.titleSize}"/><w:szCs w:val="${template.titleSize}"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ResumeMeta"><w:name w:val="Resume Metadata"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="35" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr>${fonts}<w:color w:val="64748B"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Resume Section"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="180" w:after="70"/><w:keepNext/><w:keepLines/></w:pPr><w:rPr>${fonts}<w:b/><w:color w:val="${template.accent}"/><w:sz w:val="${template.headingSize}"/><w:szCs w:val="${template.headingSize}"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ResumeList"><w:name w:val="Resume List"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="${Math.max(35, template.bodyAfter - 20)}" w:line="${template.line}" w:lineRule="auto"/></w:pPr><w:rPr>${fonts}<w:sz w:val="${template.bodySize}"/><w:szCs w:val="${template.bodySize}"/></w:rPr></w:style>
</w:styles>`
}

function buildNumberingXml(template) {
  const baseIndent = template === DOCX_TEMPLATES.compact ? 400 : 480
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="multilevel"/>
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="-"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="${baseIndent}"/></w:tabs><w:ind w:left="${baseIndent}" w:hanging="240"/></w:pPr></w:lvl>
    <w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="-"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="${baseIndent + 420}"/></w:tabs><w:ind w:left="${baseIndent + 420}" w:hanging="240"/></w:pPr></w:lvl>
  </w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`
}

function buildFooterXml(template) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:color w:val="94A3B8"/><w:sz w:val="16"/></w:rPr><w:t>简历 / </w:t></w:r><w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:color w:val="${template.accent}"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`
}

export function buildResumeDocx(resume, templateKey = 'classic') {
  if (templateKey === 'boss') return buildBossResumeDocx(resume)
  const template = resolveTemplate(templateKey)
  const paragraphs = buildResumeBlocks(resume).map(paragraphXml).join('')
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${paragraphs}<w:sectPr><w:footerReference w:type="default" r:id="rId4"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="${template.pageMargin}" w:right="${template.pageMargin}" w:bottom="${template.pageMargin}" w:left="${template.pageMargin}" w:header="600" w:footer="600"/></w:sectPr></w:body></w:document>`

  return createZip([
    { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>' },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { name: 'word/document.xml', data: documentXml },
    { name: 'word/styles.xml', data: buildStylesXml(template) },
    { name: 'word/numbering.xml', data: buildNumberingXml(template) },
    { name: 'word/footer1.xml', data: buildFooterXml(template) },
    { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>' }
  ])
}
