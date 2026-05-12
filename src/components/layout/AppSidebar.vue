<template>
  <aside class="w-64 bg-blue-900 text-white flex flex-col shadow-lg">
    <!-- Lab Identity -->
    <div class="p-5 border-b border-blue-800">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-lg flex-shrink-0">🔬</div>
        <div class="min-w-0">
          <h1 class="text-sm font-bold tracking-wide truncate leading-tight">{{ auth.lab?.name ?? 'Pathology Lab' }}</h1>
          <p class="text-xs text-blue-300 mt-0.5">Management System</p>
        </div>
      </div>
    </div>

    <!-- Main Nav -->
    <nav class="flex-1 py-4 space-y-0.5 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
        :class="{ 'bg-blue-700 text-white font-medium': isActive(item.path) }"
      >
        <span class="text-base w-5 text-center">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>

      <!-- Settings (admin only) -->
      <template v-if="auth.isAdmin">
        <div class="px-5 pt-4 pb-1">
          <p class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Settings</p>
        </div>
        <RouterLink
          v-for="item in settingsItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
          :class="{ 'bg-blue-700 text-white font-medium': isActive(item.path) }"
        >
          <span class="text-base w-5 text-center">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </template>
    </nav>

    <!-- User Footer -->
    <div class="p-4 border-t border-blue-800">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-white truncate leading-tight">{{ auth.user?.name }}</p>
          <p class="text-xs text-blue-300 capitalize">{{ auth.user?.role }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const auth  = useAuthStore()

const navItems = [
  { path: '/',         label: 'Dashboard', icon: '📊' },
  { path: '/patients', label: 'Patients',  icon: '👥' },
  { path: '/tests',    label: 'Tests',     icon: '🧪' },
  { path: '/orders',   label: 'Orders',    icon: '📋' },
  { path: '/billing',  label: 'Billing',   icon: '💰' },
]

const settingsItems = [
  { path: '/settings/lab',   label: 'Lab Settings', icon: '⚙️' },
  { path: '/settings/users', label: 'Team Members', icon: '👤' },
]

const isActive = (path) => path === '/' ? route.path === '/' : route.path.startsWith(path)

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
})
</script>
