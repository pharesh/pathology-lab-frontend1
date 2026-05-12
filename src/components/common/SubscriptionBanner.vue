<template>
  <div v-if="show" :class="bannerClass" class="px-5 py-2.5 flex items-center gap-3 text-sm">
    <span class="text-lg">{{ icon }}</span>
    <span class="flex-1 font-medium">{{ message }}</span>
    <button v-if="dismissible" @click="dismissed = true" class="text-current opacity-60 hover:opacity-100 text-lg leading-none">×</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMySubStatus } from '@/api/superadmin'

const sub       = ref(null)
const dismissed = ref(false)

const show = computed(() => !dismissed.value && sub.value && ['trial', 'grace', 'expired'].includes(sub.value.status))

const bannerClass = computed(() => ({
  'bg-yellow-50 border-b border-yellow-200 text-yellow-800': sub.value?.status === 'trial',
  'bg-orange-50 border-b border-orange-200 text-orange-800': sub.value?.status === 'grace',
  'bg-red-50 border-b border-red-200 text-red-800':         sub.value?.status === 'expired',
}))

const icon = computed(() => ({ trial: '⏳', grace: '⚠️', expired: '🔒' }[sub.value?.status]))

const message = computed(() => {
  if (!sub.value) return ''
  const days = sub.value.days_remaining ?? 0
  const plan = sub.value.plan?.name ?? 'Trial'
  if (sub.value.status === 'trial')   return `Your ${plan} trial expires in ${days} day${days !== 1 ? 's' : ''}. Contact us to upgrade.`
  if (sub.value.status === 'grace')   return `Your subscription has expired. ${days} grace day${days !== 1 ? 's' : ''} remaining. Please renew now.`
  if (sub.value.status === 'expired') return 'Your subscription has expired. Access to this lab is restricted. Please contact support.'
  return ''
})

const dismissible = computed(() => sub.value?.status !== 'expired')

onMounted(async () => {
  try {
    const res = await getMySubStatus()
    sub.value = res.data
  } catch {}
})
</script>
