<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <h2 class="text-lg font-semibold text-gray-700">{{ pageTitle }}</h2>

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-400">{{ today }}</span>

      <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
          {{ initials }}
        </div>
        <div class="text-sm leading-tight hidden sm:block">
          <div class="font-medium text-gray-800">{{ auth.user?.name }}</div>
          <div class="text-xs text-gray-400">{{ auth.user?.email }}</div>
        </div>
        <button @click="handleLogout"
          class="ml-1 text-xs text-red-500 hover:text-red-700 hover:underline font-medium">
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const titles = {
  '/':             'Dashboard',
  '/patients':     'Patients',
  '/patients/new': 'New Patient',
  '/tests':        'Test Management',
  '/tests/new':    'New Test',
  '/orders':       'Orders',
  '/orders/new':   'New Order',
  '/billing':      'Billing',
}

const pageTitle = computed(() => {
  if (route.path.endsWith('/edit')) return 'Edit Record'
  return titles[route.path] ?? 'Pathology Lab'
})

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>
