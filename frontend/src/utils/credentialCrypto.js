const textEncoder = new TextEncoder()

export function canEncryptCredentialInBrowser() {
  return Boolean(window.crypto?.subtle?.importKey && window.crypto?.subtle?.encrypt)
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function pemToArrayBuffer(pem) {
  const body = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '')

  return base64ToUint8Array(body).buffer
}

export async function encryptAuthCredential(publicKeyPem, payload) {
  if (!canEncryptCredentialInBrowser()) {
    throw new Error('当前访问环境不支持浏览器内密码加密，请使用 HTTPS 访问后重试')
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKeyPem),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  )

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    cryptoKey,
    textEncoder.encode(JSON.stringify(payload))
  )

  return window.btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}
