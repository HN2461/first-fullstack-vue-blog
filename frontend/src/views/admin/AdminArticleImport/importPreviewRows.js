const PREVIEW_DUPLICATE_SLUG_MESSAGE = '当前预览中存在重复 slug'
const LEGACY_DUPLICATE_SLUG_MESSAGE = '本次上传中存在重复 slug'

export function mergePreviewRows(existingRows = [], incomingItems = []) {
  const mergedMap = new Map()

  existingRows.forEach((row) => {
    mergedMap.set(resolvePreviewRowKey(row), row)
  })

  incomingItems.forEach((item) => {
    const row = {
      ...item,
      key: resolvePreviewRowKey(item)
    }
    mergedMap.set(row.key, row)
  })

  return normalizePreviewRows(Array.from(mergedMap.values()))
}

export function normalizePreviewRows(rows = []) {
  const slugCounts = new Map()
  rows.forEach((row) => {
    const slug = normalizeSlug(row.slug)
    if (!slug) return
    slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1)
  })

  return rows.map((row) => {
    const slug = normalizeSlug(row.slug)
    const hasPreviewDuplicate = Boolean(slug && slugCounts.get(slug) > 1)
    const errors = normalizeMessages(row.errors)
      .filter((item) => item !== PREVIEW_DUPLICATE_SLUG_MESSAGE && item !== LEGACY_DUPLICATE_SLUG_MESSAGE)
    const warnings = normalizeMessages(row.warnings)

    if (hasPreviewDuplicate) {
      errors.push(PREVIEW_DUPLICATE_SLUG_MESSAGE)
    }

    return {
      ...row,
      errors,
      warnings,
      ...resolvePreviewStatus(row, errors, warnings)
    }
  })
}

export function resolvePreviewRowKey(item = {}) {
  const sourceHash = normalizeText(item.sourceHash)
  if (sourceHash) {
    return `hash:${sourceHash}`
  }

  const slug = normalizeSlug(item.slug)
  const fileName = normalizeText(item.fileName)
  return `file:${fileName}:slug:${slug || 'empty'}`
}

function resolvePreviewStatus(row, errors, warnings) {
  if (errors.length > 0) {
    return {
      importStatus: 'error',
      importStatusLabel: '有错误',
      canImport: false
    }
  }

  if (row.duplicateArticle || row.importStatus === 'duplicate') {
    return {
      importStatus: 'duplicate',
      importStatusLabel: '疑似重复',
      canImport: false
    }
  }

  if (warnings.length > 0) {
    return {
      importStatus: 'warning',
      importStatusLabel: '需要确认',
      canImport: true
    }
  }

  return {
    importStatus: 'ready',
    importStatusLabel: '可导入',
    canImport: true
  }
}

function normalizeMessages(messages = []) {
  return Array.isArray(messages)
    ? messages.map((item) => normalizeText(item)).filter(Boolean)
    : []
}

function normalizeSlug(value) {
  return normalizeText(value).toLowerCase()
}

function normalizeText(value) {
  return String(value ?? '').trim()
}
