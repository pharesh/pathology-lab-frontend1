<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Dashboard</h1>
      <p class="text-gray-400 text-sm mt-1">Platform overview across all labs</p>
    </div>

    <!-- KPI Cards -->
    <div v-if="store.loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="i in 8" :key="i" class="bg-gray-800 rounded-xl h-24 animate-pulse"></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Labs</p>
          <p class="text-3xl font-bold text-white mt-1">{{ s.total_labs ?? 0 }}</p>
          <p class="text-xs text-green-400 mt-1">+{{ s.new_labs_this_month ?? 0 }} this month</p>
        </div>
        <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5">
          <p class="text-xs text-indigo-200 font-medium uppercase tracking-wide">Active Subs</p>
          <p class="text-3xl font-bold text-white mt-1">{{ s.active_subs ?? 0 }}</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">On Trial</p>
          <p class="text-3xl font-bold text-yellow-400 mt-1">{{ s.trial_subs ?? 0 }}</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Expired</p>
          <p class="text-3xl font-bold text-red-400 mt-1">{{ s.expired_subs ?? 0 }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 col-span-2">
          <p class="text-xs text-green-200 font-medium uppercase tracking-wide">Monthly Recurring Revenue (MRR)</p>
          <p class="text-4xl font-bold text-white mt-1">₹{{ formatCurrency(s.mrr) }}</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Patients</p>
          <p class="text-3xl font-bold text-white mt-1">{{ s.total_patients ?? 0 }}</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Orders</p>
          <p class="text-3xl font-bold text-white mt-1">{{ s.total_orders ?? 0 }}</p>
        </div>
      </div>

      <!-- Recent Labs -->
      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 class="font-semibold text-white">Recently Registered Labs</h2>
          <RouterLink to="/super/labs" class="text-sm text-indigo-400 hover:text-indigo-300">View all →</RouterLink>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-gray-900">
            <tr>
              <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Lab</th>
              <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Plan</th>
              <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Status</th>
              <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Days Left</th>
              <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Joined</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lab in s.recent_labs" :key="lab.id" class="border-b border-gray-700/50 hover:bg-gray-700/30">
              <td class="px-5 py-3">
                <p class="font-medium text-white">{{ lab.name }}</p>
                <p class="text-xs text-gray-400">{{ lab.email }}</p>
              </td>
              <td class="px-5 py-3 text-gray-300">{{ lab.subscription?.plan ?? '—' }}</td>
              <td class="px-5 py-3"><SubBadge :status="lab.subscription?.status" /></td>
              <td class="px-5 py-3 text-gray-300">{{ lab.subscription?.days_remaining ?? '—' }}</td>
              <td class="px-5 py-3 text-gray-400 text-xs">{{ formatDate(lab.created_at) }}</td>
              <td class="px-5 py-3">
                <RouterLink :to="`/super/labs/${lab.id}`" class="text-indigo-400 hover:text-indigo-300 text-xs hover:underline">Manage</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSuperAdminStore } from '@/stores/superAdminStore'
import SubBadge from '@/components/common/SubBadge.vue'

const store = useSuperAdminStore()
const s = computed(() => store.stats ?? {})

const formatCurrency = (v) => Number(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'

onMounted(() => store.fetchStats())
</script>
