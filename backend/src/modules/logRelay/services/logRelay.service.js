import { LogRelayEntry } from '#modules/logRelay/models/LogRelayEntry.js'

export const LOG_RELAY_MAX_BYTES = 2 * 1024 * 1024

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function assertLogContent(content) {
  if (typeof content !== 'string' || content.length === 0) {
    throw createError(400, 'LOG_CONTENT_REQUIRED', '日志内容不能为空')
  }

  const byteLength = Buffer.byteLength(content, 'utf8')
  if (byteLength > LOG_RELAY_MAX_BYTES) {
    throw createError(413, 'LOG_CONTENT_TOO_LARGE', '单次日志不能超过 2 MB')
  }

  return { content, byteLength }
}

export function normalizeLogContent(body) {
  if (typeof body === 'string') return body
  if (body && typeof body.content === 'string') return body.content
  return ''
}

export async function createLogRelayEntry(body) {
  const { content, byteLength } = assertLogContent(normalizeLogContent(body))
  const entry = await LogRelayEntry.create({ content })

  return {
    ...entry.toSafeJSON(),
    byteLength
  }
}

export async function listLogRelayEntries() {
  const entries = await LogRelayEntry.find({})
    .sort({ receivedAt: 1, _id: 1 })

  const items = entries.map((entry) => entry.toSafeJSON())
  const content = items.map((item) => item.content).join('\n\n')

  return {
    items,
    content,
    count: items.length,
    totalBytes: Buffer.byteLength(content, 'utf8')
  }
}

export async function clearLogRelayEntries() {
  const entries = await LogRelayEntry.find({}).select('content').lean()
  const result = await LogRelayEntry.deleteMany({})

  return {
    clearedCount: result.deletedCount || 0,
    clearedBytes: entries.reduce((total, entry) => total + Buffer.byteLength(entry.content || '', 'utf8'), 0)
  }
}
