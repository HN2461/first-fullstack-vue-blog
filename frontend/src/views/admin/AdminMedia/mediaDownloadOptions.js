function sanitizeNameSegment(value, fallback = '资源') {
  const normalized = String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .slice(0, 120)

  return normalized || fallback
}

function getExtension(record = {}) {
  const source = String(record.filename || record.originalName || '')
  const match = source.match(/(\.[^.\\/]+)$/)
  return match?.[1] || ''
}

function getDisplayBaseName(record = {}) {
  const originalName = String(record.originalName || '').trim()
  const extension = originalName.match(/(\.[^.\\/]+)$/)?.[1] || ''
  return sanitizeNameSegment(extension ? originalName.slice(0, -extension.length) : originalName)
}

function getUniqueName(fileName, usedNames) {
  const key = fileName.toLocaleLowerCase('zh-CN')
  if (!usedNames.has(key)) {
    usedNames.add(key)
    return fileName
  }

  const extension = fileName.match(/(\.[^.\\/]+)$/)?.[1] || ''
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName
  let suffix = 2
  let candidate = `${baseName}-${suffix}${extension}`
  while (usedNames.has(candidate.toLocaleLowerCase('zh-CN'))) {
    suffix += 1
    candidate = `${baseName}-${suffix}${extension}`
  }
  usedNames.add(candidate.toLocaleLowerCase('zh-CN'))
  return candidate
}

export function formatMediaDownloadDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

export function createDefaultArchiveName(date = new Date()) {
  return `媒体资源-${formatMediaDownloadDate(date)}`
}

export function normalizeArchiveName(value, date = new Date()) {
  const requestedName = String(value || '').trim().replace(/\.zip$/i, '')
  return `${sanitizeNameSegment(requestedName, createDefaultArchiveName(date))}.zip`
}

export function buildMediaDownloadNames(records = [], options = {}) {
  const namingMode = options.namingMode || 'original'
  const prefix = sanitizeNameSegment(options.prefix, '媒体资源')
  const numberWidth = Math.max(2, String(records.length).length)
  const usedNames = new Set()

  return records.map((record, index) => {
    const sequence = String(index + 1).padStart(numberWidth, '0')
    const baseName = namingMode === 'prefix'
      ? `${prefix}-${sequence}`
      : namingMode === 'sequence'
        ? sequence
        : getDisplayBaseName(record)
    return getUniqueName(`${sanitizeNameSegment(baseName)}${getExtension(record)}`, usedNames)
  })
}

export function buildSingleMediaDownloadName(record = {}) {
  return buildMediaDownloadNames([record], { namingMode: 'original' })[0] || '资源'
}
