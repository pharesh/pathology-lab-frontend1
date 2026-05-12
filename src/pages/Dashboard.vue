<template>
  <div>
    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-3 mb-6">
      <RouterLink to="/patients/new"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
        <span class="text-base">+</span> New Patient
      </RouterLink>
      <RouterLink to="/orders/new"
        class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
        <span class="text-base">+</span> New Order
      </RouterLink>
      <RouterLink to="/orders?status=pending"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
        Pending Orders
      </RouterLink>
      <RouterLink to="/billing?payment_status=unpaid"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
        Unpaid Bills
      </RouterLink>
    </div>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <div v-for="i in 8" :key="i" class="bg-white rounded-xl border border-gray-100 p-5 h-24 animate-pulse bg-gray-50"></div>
    </div>

    <div v-else>
      <!-- Primary Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">👥</div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Patients Today</p>
            <p class="text-3xl font-bold text-gray-800 leading-none mt-1">{{ stats.patients_today ?? 0 }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">📋</div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Orders Today</p>
            <p class="text-3xl font-bold text-gray-800 leading-none mt-1">{{ stats.orders_today ?? 0 }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending Orders</p>
            <p class="text-3xl font-bold text-gray-800 leading-none mt-1">{{ stats.pending_orders ?? 0 }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">💳</div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Unpaid Bills</p>
            <p class="text-3xl font-bold text-gray-800 leading-none mt-1">{{ stats.unpaid_bills ?? 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Revenue + Totals Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-5 text-white">
          <p class="text-xs font-medium uppercase tracking-wide text-green-100">Revenue Today</p>
          <p class="text-2xl font-bold leading-none mt-1">₹{{ formatCurrency(stats.revenue_today) }}</p>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-5 text-white">
          <p class="text-xs font-medium uppercase tracking-wide text-blue-100">Revenue This Month</p>
          <p class="text-2xl font-bold leading-none mt-1">₹{{ formatCurrency(stats.revenue_month) }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">🏥</div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Patients</p>
            <p class="text-3xl font-bold text-gray-800 leading-none mt-1">{{ stats.total_patients ?? 0 }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">✅</div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Completed Orders</p>
            <p class="text-3xl font-bold text-gray-800 leading-none mt-1">{{ stats.completed_orders ?? 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Recent Orders</h2>
          <RouterLink to="/orders" class="text-sm text-blue-600 hover:underline">View all →</RouterLink>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Order ID</th>
              <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Patient</th>
              <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Date</th>
              <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Status</th>
              <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Payment</th>
              <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in stats.recent_orders" :key="o.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="px-5 py-3 font-mono text-xs text-blue-600 font-medium">{{ o.order_uid }}</td>
              <td class="px-5 py-3">
                <span class="font-medium text-gray-800">{{ o.patient_name }}</span>
                <span class="block text-xs text-gray-400">{{ o.patient_uid }}</span>
              </td>
              <td class="px-5 py-3 text-gray-500 text-xs">{{ formatDate(o.ordered_at) }}</td>
              <td class="px-5 py-3"><StatusBadge :status="o.status" /></td>
              <td class="px-5 py-3"><StatusBadge :status="o.payment" /></td>
              <td class="px-5 py-3 flex gap-3">
                <RouterLink :to="`/orders/${o.id}`" class="text-blue-600 hover:underline text-xs">Results</RouterLink>
                <RouterLink v-if="o.bill_id" :to="`/billing/${o.bill_id}`" class="text-green-600 hover:underline text-xs">Bill</RouterLink>
                <button v-if="o.status === 'completed'" @click="getPdf(o)" :disabled="downloadingFor === o.id"
                  class="text-purple-600 hover:underline text-xs disabled:opacity-40">
                  {{ downloadingFor === o.id ? '…' : 'PDF' }}
                </button>
              </td>
            </tr>
            <tr v-if="!stats.recent_orders?.length">
              <td colspan="6" class="text-center py-8 text-gray-400">No orders yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getStats } from '@/api/dashboard'
import { downloadReport } from '@/api/orders'
import StatusBadge from '@/components/common/StatusBadge.vue'

const stats = ref({})
const loading = ref(true)
const downloadingFor = ref(null)

async function getPdf(o) {
  downloadingFor.value = o.id
  try {
    await downloadReport(o.id, o.order_uid)
  } catch {
    alert('Failed to download report.')
  } finally {
    downloadingFor.value = null
  }
}

const formatCurrency = (val) => Number(val ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'

onMounted(async () => {
  try {
    const res = await getStats()
    stats.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
