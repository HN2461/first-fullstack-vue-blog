function createPublishError(code, message) {
  const error = new Error(message)
  error.statusCode = 400
  error.code = code
  return error
}

export function calculateWordCount(content) {
  const cleaned = String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_\-[\]()`]/g, ' ')
    .trim()

  if (!cleaned) return 0

  const chineseChars = cleaned.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const latinWords = cleaned
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return chineseChars + latinWords
}

export function calculateReadingMinutes(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 400))
}

export function getPublishBlockers(article) {
  const blockers = []
  const contentMode = article.contentMode || 'markdown'

  if (!String(article.title || '').trim()) blockers.push('发布前请填写文章标题')

  if (contentMode === 'document' && !String(article.document?.originalUrl || '').trim()) {
    blockers.push('发布前请上传 Word 原始文档')
  } else if (contentMode === 'document' && article.document?.conversionStatus !== 'ready') {
    blockers.push('Word 文档尚未准备好阅读')
  } else if (contentMode === 'markdown' && !String(article.contentMarkdown || '').trim()) {
    blockers.push('发布前请填写正文内容')
  }

  if (!String(article.summary || '').trim()) blockers.push('发布前请填写文章摘要')
  if (!article.category) blockers.push('发布前请选择所属分类')
  return blockers
}

export function assertArticlePublishable(article) {
  const blockers = getPublishBlockers(article)
  if (blockers.length === 0) return

  const message = blockers[0]
  const codeMap = {
    发布前请填写文章标题: 'ARTICLE_TITLE_REQUIRED',
    发布前请填写正文内容: 'ARTICLE_CONTENT_REQUIRED',
    '发布前请上传 Word 原始文档': 'ARTICLE_DOCUMENT_REQUIRED',
    'Word 文档尚未准备好阅读': 'ARTICLE_DOCUMENT_NOT_READY',
    发布前请填写文章摘要: 'ARTICLE_SUMMARY_REQUIRED',
    发布前请选择所属分类: 'ARTICLE_CATEGORY_REQUIRED'
  }
  throw createPublishError(codeMap[message] || 'ARTICLE_PUBLISH_INVALID', message)
}

export function normalizeArticleDocument(document = {}) {
  return {
    originalMediaId: document.originalMediaId || null,
    originalName: document.originalName || '',
    originalUrl: document.originalUrl || '',
    mimeType: document.mimeType || '',
    previewMediaId: document.previewMediaId || null,
    previewUrl: document.previewUrl || '',
    previewMimeType: document.previewMimeType || '',
    extractedText: document.extractedText || '',
    conversionStatus: document.conversionStatus || 'pending',
    conversionMessage: document.conversionMessage || '',
    convertedAt: document.convertedAt || null
  }
}

export function getArticleContentText(input = {}) {
  return input.contentMode === 'document'
    ? input.document?.extractedText || ''
    : input.contentMarkdown || ''
}

export function normalizeArticleResources(resources = []) {
  return Array.isArray(resources)
    ? resources
      .filter((item) => item && item.url && item.name)
      .map((item) => ({
        mediaId: item.mediaId || null,
        name: item.name.trim(),
        url: item.url.trim(),
        kind: item.kind === 'image' ? 'image' : 'attachment',
        description: item.description || '',
        fileSize: Number(item.fileSize) || 0,
        mimeType: item.mimeType || ''
      }))
    : []
}
