import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '../src/utils/uploadPath.js'

describe('upload path utils', () => {
  it('uses absolute upload directories without nesting them under backend root', () => {
    const config = {
      rootDir: '/www/personal-blog/backend',
      uploadDir: '/www/personal-blog/uploads'
    }

    expect(resolveUploadRoot(config)).toBe('/www/personal-blog/uploads')
    expect(resolveLegacyUploadRoot(config)).toBe('/www/personal-blog/uploads')
  })

  it('keeps relative upload directories under the backend root for local development', () => {
    const config = {
      rootDir: '/repo/backend',
      uploadDir: 'uploads'
    }

    expect(resolveUploadRoot(config)).toBe(path.resolve('/repo/backend/uploads'))
    expect(resolveLegacyUploadRoot(config)).toBe(path.resolve('/repo/uploads'))
  })
})
