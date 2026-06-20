import path from 'node:path'
import { env } from '#config/env'

export function resolveUploadRoot(config = env) {
  return path.isAbsolute(config.uploadDir)
    ? config.uploadDir
    : path.resolve(config.rootDir, config.uploadDir)
}

export function resolveLegacyUploadRoot(config = env) {
  return path.isAbsolute(config.uploadDir)
    ? config.uploadDir
    : path.resolve(config.rootDir, '..', config.uploadDir)
}
