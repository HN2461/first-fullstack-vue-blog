import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getCurrentUser,
  getStoredToken,
  loginAccount,
  registerAccount,
  setStoredToken
} from '@/services/http'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(getStoredToken())
  const ready = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function restoreSession() {
    if (!token.value) {
      ready.value = true
      return
    }

    try {
      user.value = await getCurrentUser()
    } catch {
      logout()
    } finally {
      ready.value = true
    }
  }

  async function register(form) {
    const result = await registerAccount(form)
    token.value = result.token
    user.value = result.user
    setStoredToken(result.token)
  }

  async function login(form) {
    const result = await loginAccount(form)
    token.value = result.token
    user.value = result.user
    setStoredToken(result.token)
  }

  function logout() {
    token.value = ''
    user.value = null
    setStoredToken('')
  }

  return {
    user,
    token,
    ready,
    isLoggedIn,
    isAdmin,
    restoreSession,
    register,
    login,
    logout
  }
})
