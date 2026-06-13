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

/**
 * 获取验证码
 * @returns {Promise<{captchaId: string, captchaSvg: string}>}
 */
export function getCaptcha() {
  return request('/api/captcha/generate')
}

/**
 * 验证验证码
 * @param {string} captchaId - 验证码 ID
 * @param {string} captchaText - 用户输入的验证码
 */
export function verifyCaptcha(captchaId, captchaText) {
  return request('/api/captcha/verify', {
    method: 'POST',
    body: JSON.stringify({ captchaId, captchaText })
  })
}

// ==================== 个人信息相关 ====================

/**
 * 获取个人信息
 */
export function getProfile() {
  return request('/api/profile')
}

/**
 * 更新个人信息
 * @param {Object} data - { username?, bio? }
 */
export function updateProfile(data) {
  return request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * 上传头像
 * @param {File} file - 头像文件
 */
export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  const token = getStoredToken()
  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || '上传失败')
  }
  return payload?.data ?? null
}

/**
 * 修改密码
 * @param {Object} data - { oldPassword, newPassword }
 */
export function changePassword(data) {
  return request('/api/profile/password', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * 获取用户统计数据
 * @returns {Promise<{articles: number, comments: number, likes: number}>}
 */
export function getUserStats() {
  return request('/api/profile/stats')
}
