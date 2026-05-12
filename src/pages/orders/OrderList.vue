<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div class="flex gap-3">
        <select v-model="filters.status" @change="load" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input v-model="filters.date" @change="load" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <RouterLink to="/orders/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
        + New Order
      </RouterLink>
    </div>

    <LoadingSpinner v-if="store.loading" />
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Order ID</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Patient</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Payment</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in store.orders" :key="o.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ o.order_uid }}</td>
            <td class="px-4 py-3 font-medium">{{ o.patient?.name }}<br><span class="text-xs text-gray-400">{{ o.patient?.patient_uid }}</span></td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(o.ordered_at) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="o.status" /></td>
            <td class="px-4 py-3"><StatusBadge :status="o.bill?.payment_status ?? 'no bill'" /></td>
            <td class="px-4 py-3 flex gap-2 items-center">
              <RouterLink :to="`/orders/${o.id}`" class="text-blue-600 hover:underline text-xs">Results</RouterLink>
              <RouterLink v-if="o.bill" :to="`/billing/${o.bill.id}`" class="text-green-600 hover:underline text-xs">Bill</RouterLink>
              <button
                v-else-if="o.status === 'completed'"
                @click="createBill(o)"
                :disabled="creatingFor === o.id"
                class="text-orange-600 hover:underline text-xs disabled:opacity-40"
              >{{ creatingFor === o.id ? '…' : '+ Bill' }}</button>
              <button v-if="o.status === 'completed'" @click="getPdf(o)" :disabled="downloadingFor === o.id"
                class="text-purple-600 hover:underline text-xs disabled:opacity-40">
                {{ downloadingFor === o.id ? '…' : 'PDF' }}
              </button>
            </td>
          </tr>
          <tr v-if="!store.orders.length">
            <td colspan="6" class="text-center py-8 text-gray-400">No orders found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import { useBillStore } from '@/stores/billStore'
import { downloadReport } from '@/api/orders'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const router = useRouter()
const store = useOrderStore()
const billStore = useBillStore()
const filters = ref({ status: '', date: '' })
const creatingFor = ref(null)
const downloadingFor = ref(null)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'
const load = () => store.fetchOrders({ status: filters.value.status || undefined, date: filters.value.date || undefined })

async function getPdf(order) {
  downloadingFor.value = order.id
  try {
    await downloadReport(order.id, order.order_uid)
  } catch {
    alert('Failed to download report.')
  } finally {
    downloadingFor.value = null
  }
}

async function createBill(order) {
  creatingFor.value = order.id
  try {
    const bill = await billStore.createBill({ order_id: order.id })
    router.push(`/billing/${bill.id}`)
  } catch {
    alert('Failed to create bill. It may already exist.')
  } finally {
    creatingFor.value = null
  }
}

onMounted(load)
</script>
