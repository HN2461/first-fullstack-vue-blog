import axios from 'axios'
import { canEncryptCredentialInBrowser, encryptAuthCredential } from '@/utils/credentialCrypto'

const TOKEN_KEY = 'blog-access-token'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

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

// 创建 axios 实例
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动添加 token，兼容旧版 Bearer 逻辑
http.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // FormData 时删除 Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理响应
http.interceptors.response.use(
  (response) => {
    const payload = response.data

    if (typeof Blob !== 'undefined' && payload instanceof Blob) {
      return payload
    }

    // 后端统一返回 { success, message, data }
    if (payload && payload.success === false) {
      const error = new Error(payload.message || '请求失败')
      error.code = payload.code
      error.details = payload.details
      return Promise.reject(error)
    }

    // 返回 data 字段（解包一层）
    return payload?.data ?? null
  },
  (error) => {
    // 网络错误、超时等
    if (error.response) {
      const payload = error.response.data
      const message = payload?.message || `请求失败：${error.response.status}`
      const err = new Error(message)
      err.code = payload?.code
      err.status = error.response.status

      // 401 未授权：清除 token，跳转登录
      if (error.response.status === 401) {
        setStoredToken('')
        // 可选：跳转到登录页
        // window.location.href = '/login'
      }

      return Promise.reject(err)
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }

    return Promise.reject(error)
  }
)

// 兼容旧的 request 函数（逐步迁移用）
export async function request(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options

  const config = {
    url: path,
    method: method.toLowerCase(),
    headers
  }

  if (body) {
    // 如果 body 是 FormData，直接作为 data
    if (body instanceof FormData) {
      config.data = body
    } else {
      // JSON 字符串需要解析回对象
      config.data = typeof body === 'string' ? JSON.parse(body) : body
    }
  }

  return http(config)
}

// ==================== 认证相关 ====================

export function getHealth() {
  return http.get('/api/health')
}

export function registerAccount(data) {
  return http.post('/api/auth/register', data)
}

export function loginAccount(data) {
  return http.post('/api/auth/login', data)
}

export function getAuthChallenge(purpose) {
  return http.get('/api/auth/challenge', {
    params: { purpose }
  })
}

export function logoutAccount() {
  return http.post('/api/auth/logout')
}

export function inspectPasswordResetLink(token) {
  return http.post('/api/auth/password-reset/inspect', { token })
}

export async function consumePasswordResetLink(token, data) {
  const challenge = await getAuthChallenge('password-reset-link')
  const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
    purpose: 'password-reset-link',
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword
  })
  return http.post('/api/auth/password-reset/consume', {
    token,
    credential: { challengeId: challenge.challengeId, payload: encryptedPayload }
  })
}

export function getCurrentUser() {
  return http.get('/api/auth/me')
}

/**
 * 获取验证码
 * @returns {Promise<{captchaId: string, captchaSvg: string}>}
 */
export function getCaptcha() {
  return http.get('/api/captcha/generate')
}

/**
 * 验证验证码
 * @param {string} captchaId - 验证码 ID
 * @param {string} captchaText - 用户输入的验证码
 */
export function verifyCaptcha(captchaId, captchaText) {
  return http.post('/api/captcha/verify', { captchaId, captchaText })
}

// ==================== 个人信息相关 ====================

/**
 * 获取个人信息
 */
export function getProfile() {
  return http.get('/api/profile')
}

/**
 * 更新个人信息
 * @param {Object} data - 个人资料与界面偏好字段
 */
export function updateProfile(data) {
  return http.put('/api/profile', data)
}

/**
 * 保存当前登录用户的个人主题偏好。
 * @param {'default'|'light'|'dark'} themePreference - default 表示继承站点默认主题
 * @returns {Promise<Object>} 包含最新主题偏好的安全用户信息
 * @throws {Error} 未登录或主题值不受支持时由统一响应拦截器抛出
 */
export function updateThemePreference(themePreference) {
  return http.put('/api/profile/theme', { themePreference })
}

export function getFestivalEffectState() {
  return http.get('/api/profile/festival-effect')
}

export function updateFestivalEffectState(action) {
  return http.put('/api/profile/festival-effect', { action })
}

/**
 * 获取通知偏好
 * @returns {Promise<{email: boolean, site: boolean, comment: boolean, like: boolean}>}
 */
export function getNotificationSettings() {
  return http.get('/api/profile/notifications')
}

/**
 * 更新通知偏好
 * @param {Object} data - { email?, site?, comment?, like? }
 */
export function updateNotificationSettings(data) {
  return http.put('/api/profile/notifications', data)
}

/**
 * 保存当前用户工作台快捷功能排序
 * @param {string[]} routes - 快捷功能路由路径
 */
export function updateQuickActions(routes) {
  return http.put('/api/profile/quick-actions', { routes })
}

/**
 * 获取登录记录。当前后端仅返回待接入真实审计数据的空状态。
 */
export function getLoginRecords() {
  return http.get('/api/profile/login-records')
}

export function listMyPermissionRequests(params = {}) {
  return http.get('/api/profile/permission-requests', { params })
}

export function listMyPermissionRequestRoles() {
  return http.get('/api/profile/permission-request-roles')
}

export function createMyPermissionRequest(data) {
  return http.post('/api/profile/permission-requests', data)
}

/**
 * 上传头像
 * @param {File} file - 头像文件
 */
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  return http.post('/api/profile/avatar', formData)
}

/**
 * 删除当前头像
 */
export function deleteAvatar() {
  return http.delete('/api/profile/avatar')
}

/**
 * 修改密码。密码字段在浏览器内先完成一次性公钥加密，再提交给后端。
 * @param {Object} data - { oldPassword, newPassword }
 */
export async function changePassword(data) {
  if (!canEncryptCredentialInBrowser()) {
    return http.put('/api/profile/password', {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    })
  }

  const challenge = await getAuthChallenge('change-password')
  const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
    purpose: 'change-password',
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    oldPassword: data.oldPassword,
    newPassword: data.newPassword
  })

  return http.put('/api/profile/password', {
    credential: {
      challengeId: challenge.challengeId,
      payload: encryptedPayload
    }
  })
}

/**
 * 获取用户统计数据
 * @returns {Promise<{articles: number, comments: number, likes: number}>}
 */
export function getUserStats() {
  return http.get('/api/profile/stats')
}

export { http }
export default http
