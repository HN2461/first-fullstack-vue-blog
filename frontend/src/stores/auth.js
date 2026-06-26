import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getAuthChallenge,
  getCurrentUser,
  getStoredToken,
  loginAccount,
  logoutAccount,
  registerAccount,
  resetAccountPassword,
  setStoredToken
} from '@/services/http'
import { canEncryptCredentialInBrowser, encryptAuthCredential } from '@/utils/credentialCrypto'
import { cacheEntranceEffectConfig } from '@/utils/entranceEffects/entranceEffectStorage'
import { isRoutePathMatched } from '@/utils/routeMatch'

const MENU_CACHE_KEY = 'blog-auth-menu-cache'

function readMenuCache() {
  try {
    return JSON.parse(localStorage.getItem(MENU_CACHE_KEY) || '{}') || {}
  } catch {
    return {}
  }
}

function writeMenuCache(userInfo) {
  if (!userInfo?.id || !userInfo?.permissions) return

  const permissions = userInfo.permissions || {}
  const hasMenus = Array.isArray(permissions.menus) && permissions.menus.length > 0
  const hasPaths = Array.isArray(permissions.menuPaths) && permissions.menuPaths.length > 0
  if (!hasMenus && !hasPaths) return

  localStorage.setItem(MENU_CACHE_KEY, JSON.stringify({
    userId: userInfo.id,
    cachedAt: Date.now(),
    permissions: {
      menus: permissions.menus || [],
      menuGroups: permissions.menuGroups || permissions.menus || [],
      rootMenus: permissions.rootMenus || permissions.menuGroups || permissions.menus || [],
      flatMenus: permissions.flatMenus || [],
      menuPaths: permissions.menuPaths || []
    }
  }))
}

function clearMenuCache() {
  localStorage.removeItem(MENU_CACHE_KEY)
}

function mergeCachedPermissions(userInfo) {
  if (!userInfo?.id) return userInfo

  const cache = readMenuCache()
  if (cache.userId !== userInfo.id || !cache.permissions) {
    return userInfo
  }

  const nextPermissions = userInfo.permissions || {}
  const hasMenus = Array.isArray(nextPermissions.menus) && nextPermissions.menus.length > 0
  const hasPaths = Array.isArray(nextPermissions.menuPaths) && nextPermissions.menuPaths.length > 0
  if (hasMenus || hasPaths) {
    return userInfo
  }

  return {
    ...userInfo,
    permissions: {
      ...nextPermissions,
      ...cache.permissions
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(getStoredToken())
  const ready = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isSuperAdmin = computed(() => !!user.value?.isSuperAdmin)
  const menuPaths = computed(() => user.value?.permissions?.menuPaths || [])
  const managementMenus = computed(() => {
    return user.value?.permissions?.rootMenus ||
      user.value?.permissions?.menuGroups ||
      user.value?.permissions?.menus ||
      []
  })
  const rootMenus = computed(() => {
    return (managementMenus.value || [])
      .filter((menu) => menu.enabled !== false && !menu.hidden)
      .map((menu) => ({
        ...menu,
        source: menu.source || (menu.id === 'knowledge' || menu.code === 'knowledge.root' ? 'knowledge' : 'rbac'),
        children: (menu.children || []).filter((child) => child.enabled !== false && !child.hidden)
      }))
  })
  const isAdmin = computed(() => {
    return isSuperAdmin.value ||
      menuPaths.value.some((path) => path === '/console' || path.startsWith('/console/manage'))
  })

  function canAccessPath(path) {
    if (!path) return false
    if (isSuperAdmin.value) return true
    if (menuPaths.value.some((menuPath) => isRoutePathMatched(path, menuPath))) {
      return true
    }
    if (path.startsWith('/console/articles/') ||
      path.startsWith('/console/article-directory/') ||
      path.startsWith('/console/categories/') ||
      path.startsWith('/console/tags/')
    ) {
      return isLoggedIn.value
    }

    if (path === '/console') {
      return menuPaths.value.includes('/console') || isAdmin.value
    }

    return false
  }

  async function restoreSession() {
    try {
      const currentUser = await getCurrentUser()
      user.value = mergeCachedPermissions(currentUser)
      writeMenuCache(user.value)
      cacheEntranceEffectConfig(user.value?.entranceEffect)
    } catch {
      clearSession()
    } finally {
      ready.value = true
    }
  }

  async function refreshCurrentUser() {
    const currentUser = await getCurrentUser()
    user.value = currentUser
    writeMenuCache(currentUser)
    cacheEntranceEffectConfig(currentUser?.entranceEffect)
    return currentUser
  }

  async function register(form) {
    if (!canEncryptCredentialInBrowser()) {
      const result = await registerAccount({
        username: form.username,
        email: form.email,
        password: form.password,
        permissionRequestReason: form.permissionRequestReason || undefined
      })
      token.value = result.token || ''
      user.value = result.user
      writeMenuCache(user.value)
      cacheEntranceEffectConfig(user.value?.entranceEffect)
      setStoredToken(token.value)
      return
    }

    const challenge = await getAuthChallenge('register')
    const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
      purpose: 'register',
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      password: form.password
    })
    const result = await registerAccount({
      username: form.username,
      email: form.email,
      permissionRequestReason: form.permissionRequestReason || undefined,
      credential: {
        challengeId: challenge.challengeId,
        payload: encryptedPayload
      }
    })
    token.value = ''
    user.value = result.user
    writeMenuCache(user.value)
    cacheEntranceEffectConfig(user.value?.entranceEffect)
    setStoredToken('')
  }

  async function login(form) {
    if (!canEncryptCredentialInBrowser()) {
      const result = await loginAccount({
        email: form.email,
        password: form.password
      })
      token.value = result.token || ''
      user.value = result.user
      writeMenuCache(user.value)
      cacheEntranceEffectConfig(user.value?.entranceEffect)
      setStoredToken(token.value)
      return
    }

    const challenge = await getAuthChallenge('login')
    const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
      purpose: 'login',
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      password: form.password
    })
    const result = await loginAccount({
      email: form.email,
      credential: {
        challengeId: challenge.challengeId,
        payload: encryptedPayload
      }
    })
    token.value = ''
    user.value = result.user
    writeMenuCache(user.value)
    cacheEntranceEffectConfig(user.value?.entranceEffect)
    setStoredToken('')
  }

  async function resetPassword(form) {
    if (!canEncryptCredentialInBrowser()) {
      await resetAccountPassword({
        email: form.email,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      })
      return
    }

    const challenge = await getAuthChallenge('reset-password')
    const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
      purpose: 'reset-password',
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword
    })

    await resetAccountPassword({
      email: form.email,
      credential: {
        challengeId: challenge.challengeId,
        payload: encryptedPayload
      }
    })
  }

  function clearSession() {
    token.value = ''
    user.value = null
    setStoredToken('')
    clearMenuCache()
  }

  async function logout() {
    try {
      await logoutAccount()
    } finally {
      clearSession()
    }
  }

  return {
    user,
    token,
    ready,
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    menuPaths,
    managementMenus,
    rootMenus,
    canAccessPath,
    restoreSession,
    refreshCurrentUser,
    register,
    login,
    resetPassword,
    logout
  }
})
