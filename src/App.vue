<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import SuperAdminLayout from '@/components/layout/SuperAdminLayout.vue'

const route  = useRoute()
const router = useRouter()

// Don't render any layout until the router has resolved the first route.
// Without this, route.meta is empty on first render, so AppLayout mounts
// briefly on the login page and fires API calls before the guard runs.
const ready = ref(false)
router.isReady().then(() => { ready.value = true })

const isPublic     = computed(() => route.meta.public)
const isSuperAdmin = computed(() => route.meta.superAdmin)
</script>

<template>
  <template v-if="ready">
    <RouterView v-if="isPublic" />
    <SuperAdminLayout v-else-if="isSuperAdmin" />
    <AppLayout v-else />
  </template>
</template>
