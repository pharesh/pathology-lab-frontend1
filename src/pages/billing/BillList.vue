<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <select v-model="paymentStatus" @change="load" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">All Status</option>
        <option value="unpaid">Unpaid</option>
        <option value="partial">Partially Paid</option>
        <option value="paid">Paid</option>
      </select>
    </div>

    <LoadingSpinner v-if="store.loading" />
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Invoice No</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Patient</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Order</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Total (₹)</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Paid (₹)</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in store.bills" :key="b.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ b.bill_uid }}</td>
            <td class="px-4 py-3 font-medium">{{ b.order?.patient?.name }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ b.order?.order_uid }}</td>
            <td class="px-4 py-3 text-right font-semibold">₹{{ Number(b.total_amount).toFixed(2) }}</td>
            <td class="px-4 py-3 text-right text-green-600">₹{{ Number(b.amount_paid).toFixed(2) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="b.payment_status" /></td>
            <td class="px-4 py-3 flex gap-2">
              <RouterLink :to="`/billing/${b.id}`" class="text-blue-600 hover:underline text-xs">View</RouterLink>
              <a :href="`/api/v1/orders/${b.order_id}/invoice`" target="_blank" class="text-purple-600 hover:underline text-xs">Invoice PDF</a>
            </td>
          </tr>
          <tr v-if="!store.bills.length">
            <td colspan="7" class="text-center py-8 text-gray-400">No bills found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useBillStore } from '@/stores/billStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const store = useBillStore()
const paymentStatus = ref('')
const load = () => store.fetchBills({ payment_status: paymentStatus.value || undefined })
onMounted(load)
</script>
