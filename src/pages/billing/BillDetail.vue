<template>
  <div class="max-w-3xl mx-auto">
    <LoadingSpinner v-if="store.loading" />
    <div v-else-if="store.currentBill">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ store.currentBill.bill_uid }}</h3>
            <p class="text-sm text-gray-500 mt-1">Order: {{ store.currentBill.order?.order_uid }}</p>
            <p class="text-sm text-gray-500">Patient: {{ store.currentBill.order?.patient?.name }} ({{ store.currentBill.order?.patient?.patient_uid }})</p>
          </div>
          <div class="flex gap-2">
            <StatusBadge :status="store.currentBill.payment_status" />
            <button @click="getInvoice" :disabled="downloadingInvoice"
              class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60">
              {{ downloadingInvoice ? 'Downloading...' : 'Invoice PDF' }}
            </button>
          </div>
        </div>

        <!-- Tests -->
        <table class="w-full text-sm mb-5">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2 text-gray-600 font-medium">Test</th>
              <th class="text-right px-3 py-2 text-gray-600 font-medium">Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.currentBill.order?.order_items" :key="item.id" class="border-b border-gray-100">
              <td class="px-3 py-2">{{ item.test?.test_name }}</td>
              <td class="px-3 py-2 text-right">₹{{ Number(item.price_at_order).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div class="flex justify-end">
          <div class="w-64 space-y-1.5 text-sm">
            <div class="flex justify-between"><span class="text-gray-600">Subtotal</span><span>₹{{ Number(store.currentBill.subtotal).toFixed(2) }}</span></div>
            <div v-if="store.currentBill.discount_value > 0" class="flex justify-between text-orange-600">
              <span>Discount ({{ store.currentBill.discount_type === 'percent' ? store.currentBill.discount_value + '%' : 'Flat' }})</span>
              <span>- ₹{{ (Number(store.currentBill.subtotal) - Number(store.currentBill.total_amount)).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-base border-t border-gray-200 pt-1.5">
              <span>Total</span><span>₹{{ Number(store.currentBill.total_amount).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-green-600"><span>Amount Paid</span><span>₹{{ Number(store.currentBill.amount_paid).toFixed(2) }}</span></div>
            <div class="flex justify-between font-semibold text-red-600">
              <span>Balance</span><span>₹{{ (Number(store.currentBill.total_amount) - Number(store.currentBill.amount_paid)).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Apply Discount (only if no payments made yet) -->
      <div v-if="store.currentBill.payment_status === 'unpaid' && Number(store.currentBill.amount_paid) === 0"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <h4 class="font-semibold text-gray-700 mb-4">Apply Discount</h4>
        <div class="grid grid-cols-3 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select v-model="discount.type" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">No Discount</option>
              <option value="flat">Flat Amount (₹)</option>
              <option value="percent">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input v-model.number="discount.value" type="number" min="0" step="0.01"
              :disabled="!discount.type"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50" />
          </div>
          <button @click="applyDiscount" :disabled="discountLoading"
            class="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
            {{ discountLoading ? 'Applying...' : 'Apply' }}
          </button>
        </div>
        <p v-if="discountError" class="text-red-500 text-sm mt-2">{{ discountError }}</p>
      </div>

      <!-- Record Payment -->
      <div v-if="store.currentBill.payment_status !== 'paid'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 class="font-semibold text-gray-700 mb-4">Record Payment</h4>
        <ErrorAlert :message="store.error" class="mb-3" />
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input v-model.number="payment.amount" type="number" step="0.01" :max="store.currentBill.total_amount - store.currentBill.amount_paid"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select v-model="payment.payment_method" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="pay" :disabled="!payment.amount || !payment.payment_method || store.loading"
              class="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {{ store.loading ? 'Processing...' : 'Record Payment' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 font-semibold">
        Payment completed on {{ store.currentBill.paid_at ? new Date(store.currentBill.paid_at).toLocaleDateString('en-IN') : '' }} via {{ store.currentBill.payment_method }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBillStore } from '@/stores/billStore'
import { updateBill } from '@/api/bills'
import { downloadInvoice } from '@/api/orders'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const route = useRoute()
const store = useBillStore()
const payment = ref({ amount: '', payment_method: '' })
const discount = ref({ type: '', value: 0 })
const discountLoading = ref(false)
const discountError = ref(null)
const downloadingInvoice = ref(false)

const getInvoice = async () => {
  downloadingInvoice.value = true
  try {
    await downloadInvoice(store.currentBill.order_id, store.currentBill.bill_uid)
  } catch {
    alert('Failed to download invoice.')
  } finally {
    downloadingInvoice.value = false
  }
}

const pay = async () => {
  try {
    await store.payBill(route.params.id, payment.value)
    payment.value = { amount: '', payment_method: '' }
  } catch {}
}

const applyDiscount = async () => {
  discountLoading.value = true
  discountError.value = null
  try {
    const res = await updateBill(route.params.id, {
      discount_type: discount.value.type || null,
      discount_value: discount.value.value || 0,
    })
    store.currentBill = res.data
    discount.value = { type: res.data.discount_type ?? '', value: Number(res.data.discount_value) }
  } catch (e) {
    discountError.value = e.response?.data?.message ?? 'Failed to apply discount.'
  } finally {
    discountLoading.value = false
  }
}

onMounted(async () => {
  await store.fetchBill(route.params.id)
  const bill = store.currentBill
  discount.value = { type: bill?.discount_type ?? '', value: Number(bill?.discount_value ?? 0) }
})
</script>
