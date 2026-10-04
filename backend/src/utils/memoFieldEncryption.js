import crypto from 'node:crypto'
import { env } from '#config/env'

const IV_BYTES = 12
const KEY_CONTEXT = 'personal-record-sensitive-field-v1'

function encryptionError(message, statusCode, code) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function getCipherKey() {
  if (!env.memoEncryptionKey) {
    throw encryptionError('个人资料加密密钥未配置', 503, 'MEMO_ENCRYPTION_KEY_MISSING')
  }

  return crypto.createHash('sha256').update(`${KEY_CONTEXT}:${env.memoEncryptionKey}`).digest()
}

function contextText(context) {
  return [context.ownerId, context.memoId, context.fieldKey].map(String).join(':')
}

export function encryptMemoField(value, context) {
  const normalized = String(value || '')
  if (!normalized) return ''

  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv('aes-256-gcm', getCipherKey(), iv)
  cipher.setAAD(Buffer.from(contextText(context)))
  const encrypted = Buffer.concat([cipher.update(normalized, 'utf8'), cipher.final()])
  return ['v1', iv, cipher.getAuthTag(), encrypted]
    .map((item) => Buffer.isBuffer(item) ? item.toString('base64url') : item)
    .join('.')
}

export function decryptMemoField(payload, context) {
  if (!payload) return ''
  const [version, ivValue, authTagValue, encryptedValue] = String(payload).split('.')
  if (version !== 'v1' || !ivValue || !authTagValue || !encryptedValue) {
    throw encryptionError('个人资料密文格式无效', 500, 'MEMO_FIELD_CIPHER_INVALID')
  }

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', getCipherKey(), Buffer.from(ivValue, 'base64url'))
    decipher.setAAD(Buffer.from(contextText(context)))
    decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final()
    ]).toString('utf8')
  } catch (error) {
    if (error.code === 'MEMO_ENCRYPTION_KEY_MISSING') throw error
    throw encryptionError('个人资料解密失败，请检查服务端密钥配置', 500, 'MEMO_FIELD_DECRYPT_FAILED')
  }
}
