import path from 'node:path'
import { env } from '#config/env'

export function resolvePrivateWorkJournalRoot(config = env) {
  return config.nodeEnv === 'test'
    ? path.resolve(config.rootDir, 'tests/.tmp/work-journal-private')
    : path.resolve(config.rootDir, '..', 'work-journal-private')
}

export function resolvePrivateWorkJournalPath(storedName, config = env) {
  const root = resolvePrivateWorkJournalRoot(config)
  const target = path.resolve(root, String(storedName || ''))
  const relative = path.relative(root, target)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    const error = new Error('凭证不存在')
    error.statusCode = 404
    error.code = 'WORK_EVIDENCE_NOT_FOUND'
    throw error
  }
  return target
}
