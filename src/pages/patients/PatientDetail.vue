<template>
  <div>
    <LoadingSpinner v-if="loading" />
    <div v-else-if="patient">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ patient.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ patient.patient_uid }} | {{ patient.age }} {{ patient.age_unit }} | {{ patient.gender }} | {{ patient.phone }}</p>
            <p v-if="patient.referred_by" class="text-sm text-gray-500">Referred by: {{ patient.referred_by }}</p>
          </div>
          <div class="flex gap-2">
            <RouterLink :to="`/patients/${patient.id}/edit`" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Edit</RouterLink>
            <RouterLink to="/orders/new" :state="{ patient_id: patient.id }" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Order</RouterLink>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">Order History</div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Order ID</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Tests</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Bill</th>
              <th class="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in patient.orders" :key="order.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ order.order_uid }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(order.ordered_at) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ order.order_items?.map(i => i.test?.test_name).join(', ') }}</td>
              <td class="px-4 py-3"><StatusBadge :status="order.status" /></td>
              <td class="px-4 py-3"><StatusBadge :status="order.bill?.payment_status ?? 'no bill'" /></td>
              <td class="px-4 py-3 flex gap-2 items-center">
                <RouterLink :to="`/orders/${order.id}`" class="text-blue-600 hover:underline text-xs">Results</RouterLink>
                <RouterLink v-if="order.bill" :to="`/billing/${order.bill.id}`" class="text-green-600 hover:underline text-xs">Bill</RouterLink>
                <button v-else-if="order.status === 'completed'" @click="makeBill(order)"
                  :disabled="creatingBillFor === order.id"
                  class="text-orange-600 hover:underline text-xs disabled:opacity-40">
                  {{ creatingBillFor === order.id ? '…' : '+ Bill' }}
                </button>
                <a v-if="order.status === 'completed'" :href="`/api/v1/orders/${order.id}/report`" target="_blank" class="text-purple-600 hover:underline text-xs">PDF</a>
              </td>
            </tr>
            <tr v-if="!patient.orders?.length">
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
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getPatient } from '@/api/patients'
import { createBill } from '@/api/bills'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const patient = ref(null)
const loading = ref(true)
const creatingBillFor = ref(null)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'

async function makeBill(order) {
  creatingBillFor.value = order.id
  try {
    const res = await createBill({ order_id: order.id })
    router.push(`/billing/${res.data.id}`)
  } catch {
    alert('Failed to create bill.')
  } finally {
    creatingBillFor.value = null
  }
}

onMounted(async () => {
  try {
    const res = await getPatient(route.params.id)
    patient.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
