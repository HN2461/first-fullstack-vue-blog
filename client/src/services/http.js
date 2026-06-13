const TOKEN_KEY = 'blog-access-token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(TOKEN_KEY)
}

export async function request(path, options = {}) {
  const token = getStoredToken()
  const headers = {
    ...(options.headers || {})
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(path, {
    ...options,
    headers
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false) {
    const message = payload?.message || `请求失败：${response.status}`
    throw new Error(message)
  }

  return payload?.data ?? null
}

export function getHealth() {
  return request('/api/health')
}

export function registerAccount(data) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function loginAccount(data) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function getCurrentUser() {
  return request('/api/auth/me')
}
