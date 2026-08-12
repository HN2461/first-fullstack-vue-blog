import crypto from 'node:crypto'
import { env } from '#config/env'

const CIPHER_VERSION = 'v1'
const IV_BYTES = 12
const KEY_CONTEXT = 'media-share-extraction-code'

function getCipherKey() {
  return crypto.createHash('sha256').update(`${KEY_CONTEXT}:${env.mediaShareEncryptionKey}`).digest()
}

export function encryptMediaShareCode(code) {
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv('aes-256-gcm', getCipherKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(code), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [CIPHER_VERSION, iv, authTag, encrypted].map((item) => (
    Buffer.isBuffer(item) ? item.toString('base64url') : item
  )).join('.')
}

export function decryptMediaShareCode(payload) {
  const [version, ivValue, authTagValue, encryptedValue] = String(payload || '').split('.')
  if (version !== CIPHER_VERSION || !ivValue || !authTagValue || !encryptedValue) return ''

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', getCipherKey(), Buffer.from(ivValue, 'base64url'))
    decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final()
    ]).toString('utf8')
  } catch {
    return ''
  }
}
