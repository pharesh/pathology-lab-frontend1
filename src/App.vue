<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import SuperAdminLayout from '@/components/layout/SuperAdminLayout.vue'
import { useInactivityTimer } from '@/composables/useInactivityTimer'

const route  = useRoute()
const router = useRouter()

// Don't render any layout until the router has resolved the first route.
// Without this, route.meta is empty on first render, so AppLayout mounts
// briefly on the login page and fires API calls before the guard runs.
const ready = ref(false)
router.isReady().then(() => { ready.value = true })

const isPublic     = computed(() => route.meta.public)
const isSuperAdmin = computed(() => route.meta.superAdmin)

const { showWarning, secondsLeft, stayLoggedIn } = useInactivityTimer()

function formatSeconds(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}
</script>

<template>
  <template v-if="ready">
    <RouterView v-if="isPublic" />
    <SuperAdminLayout v-else-if="isSuperAdmin" />
    <AppLayout v-else />
  </template>

  <!-- Inactivity warning modal -->
  <div v-if="showWarning" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1">Session Expiring Soon</h3>
      <p class="text-gray-500 text-sm mb-1">You've been inactive for a while.</p>
      <p class="text-2xl font-bold text-yellow-500 mb-5">{{ formatSeconds(secondsLeft) }}</p>
      <button @click="stayLoggedIn"
        class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
        Stay Logged In
      </button>
    </div>
  </div>
</template>
