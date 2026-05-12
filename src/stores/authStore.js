import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const lab   = ref(JSON.parse(localStorage.getItem('auth_lab')  || 'null'))
  const token = ref(localStorage.getItem('auth_token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => user.value?.role === 'admin')
  const isSuperAdmin    = computed(() => user.value?.role === 'superadmin')

  function _persist(data) {
    user.value  = data.user
    lab.value   = data.lab
    token.value = data.token
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user',  JSON.stringify(data.user))
    localStorage.setItem('auth_lab',   JSON.stringify(data.lab))
  }

  function _clear() {
    user.value  = null
    lab.value   = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_lab')
  }

  async function login(credentials) {
    const res = await api.login(credentials)
    _persist(res.data)
    return res.data
  }

  async function register(data) {
    const res = await api.register(data)
    _persist(res.data)
    return res.data
  }

  async function logout() {
    try { await api.logout() } catch {}
    _clear()
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      const res = await api.getMe()
      user.value = res.data.user
      lab.value  = res.data.lab
      localStorage.setItem('auth_user', JSON.stringify(res.data.user))
      localStorage.setItem('auth_lab',  JSON.stringify(res.data.lab))
      return true
    } catch {
      _clear()
      return false
    }
  }

  return { user, lab, token, isAuthenticated, isAdmin, isSuperAdmin, login, register, logout, checkAuth }
})
