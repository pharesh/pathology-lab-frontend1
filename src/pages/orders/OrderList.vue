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
              <button v-if="o.status === 'completed'" @click="printOrder(o)" :disabled="printingFor === o.id"
                class="text-violet-600 hover:underline text-xs disabled:opacity-40">
                {{ printingFor === o.id ? '…' : 'Print' }}
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
import { downloadReport, getOrder } from '@/api/orders'
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

const printingFor = ref(null)

async function printOrder(order) {
  printingFor.value = order.id
  try {
    const res = await getOrder(order.id)
    const full    = res.data
    const patient = full.patient
    const items   = full.order_items ?? []

    const getRef = (item, paramName) => {
      const r = item.test?.reference_ranges?.find(r => r.parameter_name?.toLowerCase() === paramName?.toLowerCase())
      if (!r) return '—'
      if (r.text_range) return r.text_range
      if (r.min_value != null || r.max_value != null) return `${r.min_value ?? ''} – ${r.max_value ?? ''} ${r.unit ?? ''}`.trim()
      return '—'
    }

    const getFlag = (item, result) => {
      if (!result.is_abnormal) return ''
      const r = item.test?.reference_ranges?.find(r => r.parameter_name?.toLowerCase() === result.parameter_name?.toLowerCase())
      if (!r) return '*'
      const val = parseFloat(result.observed_value)
      if (!isNaN(val)) {
        if (r.min_value != null && val < parseFloat(r.min_value)) return 'L'
        if (r.max_value != null && val > parseFloat(r.max_value)) return 'H'
      }
      return '*'
    }

    let resultsHtml = ''
    for (const item of items) {
      if (!item.results?.length) continue
      const rows = item.results.map(r => {
        const flag = getFlag(item, r)
        return `<tr>
          <td>${r.parameter_name}</td>
          <td class="${r.is_abnormal ? 'abn' : ''}">${r.observed_value}</td>
          <td>${r.unit ?? '—'}</td>
          <td>${getRef(item, r.parameter_name)}</td>
          <td class="${flag ? 'flag' : ''}">${flag || '✓'}</td>
          <td>${r.remarks ?? '—'}</td>
        </tr>`
      }).join('')
      resultsHtml += `
        <div class="test-block">
          <div class="test-title">${item.test.test_name} <span class="test-code">(${item.test.test_code} | ${item.test.sample_type})</span></div>
          <table class="rt"><thead><tr>
            <th style="width:28%">Parameter</th>
            <th style="width:15%">Observed Value</th>
            <th style="width:10%">Unit</th>
            <th style="width:25%">Reference Range</th>
            <th style="width:7%">Flag</th>
            <th style="width:15%">Remarks</th>
          </tr></thead><tbody>${rows}</tbody></table>
        </div>`
    }

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Report – ${full.order_uid}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:11px;color:#222}
  @page{size:A4 portrait;margin:30mm 12mm 18mm 12mm}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  .pbar{background:#f5eeff;border:1px solid #c084fc;padding:8px 16px;margin:8px 0}
  .pbar table{width:100%;border-collapse:collapse}
  .pbar td{padding:2px 6px;font-size:10.5px}
  .pbar td:nth-child(odd){font-weight:bold;color:#6a0dad;width:110px}
  .test-block{margin-bottom:10px}
  .test-title{background:#7c3aed;color:#fff;padding:4px 10px;font-size:11px;font-weight:bold}
  .test-code{font-weight:normal;font-size:9px;opacity:.85}
  .rt{width:100%;border-collapse:collapse}
  .rt th{background:#ede9fe;color:#5b21b6;padding:4px 7px;text-align:left;font-size:10px;border:1px solid #ddd}
  .rt td{padding:4px 7px;border:1px solid #eee;font-size:10.5px}
  .rt tr:nth-child(even) td{background:#faf5ff}
  .abn{color:#c0392b;font-weight:bold}
  .flag{color:#c0392b;font-weight:bold}
  .ftr{margin-top:16px;border-top:2px solid #7c3aed;padding:8px 16px;display:flex;justify-content:space-between;align-items:flex-end}
  .ftr-left{font-size:9px;color:#555}
  .sig-line{width:160px;border-top:1px solid #333;text-align:center;padding-top:3px;font-size:9px}
</style></head><body>
<div class="pbar">
  <table>
    <tr>
      <td>Patient Name</td><td>${patient?.name ?? '—'}</td>
      <td>Patient ID</td><td>${patient?.patient_uid ?? '—'}</td>
      <td>Order No</td><td>${full.order_uid}</td>
    </tr>
    <tr>
      <td>Age / Sex</td><td>${patient?.age ?? '—'} ${patient?.age_unit ?? ''} / ${patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '—'}</td>
      <td>Phone</td><td>${patient?.phone ?? '—'}</td>
      <td>Referred By</td><td>${patient?.referred_by ?? 'Self'}</td>
    </tr>
  </table>
</div>
${resultsHtml}
<div class="ftr">
  <div class="ftr-left"><em>* This report is computer generated. Results are for clinical reference only.</em></div>
  <div><div class="sig-line">Pathologist Signature &amp; Seal</div></div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`

    const win = window.open('', '_blank', 'width=850,height=700')
    win.document.write(html)
    win.document.close()
  } catch {
    alert('Failed to load order for printing.')
  } finally {
    printingFor.value = null
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
