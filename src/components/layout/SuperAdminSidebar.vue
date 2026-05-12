<template>
  <aside class="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
    <!-- Brand -->
    <div class="p-5 border-b border-gray-800">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm">🔬</div>
        <div>
          <p class="text-sm font-bold text-white leading-tight">LabFlow</p>
          <p class="text-xs text-indigo-400 font-medium">Super Admin</p>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-none"
        :class="{ 'bg-gray-800 text-white border-r-2 border-indigo-500': isActive(item.path) }"
      >
        <span class="text-base w-5 text-center">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-800">
      <p class="text-xs text-gray-600 text-center">LabFlow v1.0 · Super Admin</p>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/super/dashboard', label: 'Dashboard',  icon: '📊' },
  { path: '/super/labs',      label: 'All Labs',    icon: '🏥' },
  { path: '/super/plans',     label: 'Plans',       icon: '📦' },
]

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')
</script>
