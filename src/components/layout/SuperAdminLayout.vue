<template>
  <div class="flex h-screen bg-gray-950 overflow-hidden">
    <SuperAdminSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <h2 class="text-sm font-semibold text-gray-200 uppercase tracking-widest">Super Admin Panel</h2>
        <div class="flex items-center gap-4">
          <span class="text-xs text-gray-400">{{ auth.user?.email }}</span>
          <button @click="logout"
            class="text-xs text-red-400 hover:text-red-300 border border-red-800 px-3 py-1 rounded-lg hover:bg-red-900/30 transition-colors">
            Logout
          </button>
        </div>
      </header>
      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import SuperAdminSidebar from './SuperAdminSidebar.vue'

const router = useRouter()
const auth   = useAuthStore()

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>
