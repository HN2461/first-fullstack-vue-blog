import path from 'node:path'

function countCjkChars(value) {
  return (String(value || '').match(/[\u3400-\u9fff]/gu) || []).length
}

function countMojibakeChars(value) {
  return (String(value || '').match(/[ÃÂÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßæøåœ]/gu) || []).length
}

export function decodeUploadFilename(filename) {
  const original = String(filename || '')
  if (!original || /^[\x00-\x7F]+$/.test(original)) {
    return original
  }

  const decoded = Buffer.from(original, 'latin1').toString('utf8')
  if (!decoded || decoded.includes('\uFFFD')) {
    return original
  }

  const originalCjk = countCjkChars(original)
  const decodedCjk = countCjkChars(decoded)
  if (decodedCjk > originalCjk) {
    return decoded
  }

  const originalMojibake = countMojibakeChars(original)
  const decodedMojibake = countMojibakeChars(decoded)
  if (decodedMojibake < originalMojibake) {
    return decoded
  }

  return original
}

export function buildSafeStoredFilename(filename) {
  const decodedName = decodeUploadFilename(filename)
  const ext = path.extname(decodedName)
  const basename = path.basename(decodedName, ext)
  const safeBase = basename
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

  const safeExt = ext.replace(/[^\p{L}\p{N}.-]+/gu, '')
  return safeBase ? `${safeBase}${safeExt}` : `file${safeExt || ''}`
}
