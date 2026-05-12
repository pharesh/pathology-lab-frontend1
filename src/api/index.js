import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Lock prevents multiple concurrent 401s from each triggering a redirect
let _redirecting = false

api.interceptors.response.use(
  res => res,
  err => {
    // Requests cancelled by window.location.replace — ignore silently
    if (!err.response) return Promise.reject(err)

    if (err.response.status === 401 && !_redirecting) {
      _redirecting = true
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_lab')
      window.location.replace('/login')
      return Promise.reject(err)
    }

    if (err.response.status !== 401) {
      const msg = err.response.data?.message || err.message || 'Request failed'
      console.error('[API Error]', msg, err.response.data)
    }
    return Promise.reject(err)
  }
)

export default api
