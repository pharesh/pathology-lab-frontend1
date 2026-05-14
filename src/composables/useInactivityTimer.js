import { ref, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const TIMEOUT_MS  = 30 * 60 * 1000  // 30 min → auto logout
const WARN_MS     = 2  * 60 * 1000  // show warning 2 min before logout

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

export function useInactivityTimer() {
  const auth   = useAuthStore()
  const router = useRouter()

  const showWarning    = ref(false)
  const secondsLeft    = ref(WARN_MS / 1000)
  let logoutTimer      = null
  let warnTimer        = null
  let countdownInterval = null

  function clearTimers() {
    clearTimeout(logoutTimer)
    clearTimeout(warnTimer)
    clearInterval(countdownInterval)
    logoutTimer = warnTimer = countdownInterval = null
  }

  function startCountdown() {
    secondsLeft.value = WARN_MS / 1000
    clearInterval(countdownInterval)
    countdownInterval = setInterval(() => {
      secondsLeft.value -= 1
      if (secondsLeft.value <= 0) clearInterval(countdownInterval)
    }, 1000)
  }

  function reset() {
    if (!auth.isAuthenticated) return
    showWarning.value = false
    clearTimers()

    warnTimer = setTimeout(() => {
      showWarning.value = true
      startCountdown()

      logoutTimer = setTimeout(async () => {
        showWarning.value = false
        await auth.logout()
        router.replace('/login')
      }, WARN_MS)
    }, TIMEOUT_MS - WARN_MS)
  }

  function stayLoggedIn() {
    reset()
  }

  function startListening() {
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()
  }

  function stopListening() {
    EVENTS.forEach(e => window.removeEventListener(e, reset))
    clearTimers()
    showWarning.value = false
  }

  // Start/stop automatically as auth state changes
  watch(
    () => auth.isAuthenticated,
    (isAuth) => { isAuth ? startListening() : stopListening() },
    { immediate: true }
  )

  onUnmounted(stopListening)

  return { showWarning, secondsLeft, stayLoggedIn }
}
