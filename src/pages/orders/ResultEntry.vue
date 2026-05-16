<template>
  <div>
    <LoadingSpinner v-if="loading" />
    <div v-else-if="order">
      <!-- Order Header -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-gray-800">{{ order.order_uid }} — {{ order.patient?.name }}</h3>
            <p class="text-sm text-gray-500 mt-0.5">{{ order.patient?.patient_uid }} | {{ order.patient?.age }} {{ order.patient?.age_unit }} | {{ order.patient?.gender }}</p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :status="order.status" />
            <select v-model="orderStatus" @change="changeStatus" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
            <button v-if="order.status === 'completed'" @click="printReport"
              class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Print
            </button>
            <button v-if="order.status === 'completed'" @click="downloadPdf" :disabled="downloading"
              class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
              {{ downloading ? 'Downloading...' : 'Download Report' }}
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert :message="submitError" class="mb-4" />

      <!-- Result Entry per Test -->
      <div v-for="item in order.order_items" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-blue-50">
          <div>
            <span class="font-semibold text-blue-800">{{ item.test?.test_name }}</span>
            <span class="text-xs text-gray-500 ml-2">({{ item.test?.test_code }} | {{ item.test?.sample_type }})</span>
          </div>
          <StatusBadge :status="item.status" />
        </div>
        <div class="p-4">
          <div v-if="item.results?.length && !editMode[item.id]">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-gray-500 border-b">
                  <th class="text-left pb-2">Parameter</th>
                  <th class="text-left pb-2">Value</th>
                  <th class="text-left pb-2">Unit</th>
                  <th class="text-left pb-2">Reference Range</th>
                  <th class="text-left pb-2">Flag</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in item.results" :key="r.id" class="border-b border-gray-50">
                  <td class="py-2">{{ r.parameter_name }}</td>
                  <td class="py-2" :class="r.is_abnormal ? 'text-red-600 font-bold' : ''">{{ r.observed_value }}</td>
                  <td class="py-2 text-gray-500">{{ r.unit ?? '—' }}</td>
                  <td class="py-2 text-gray-500 text-xs">{{ getReferenceRange(item, r.parameter_name) }}</td>
                  <td class="py-2" :class="r.is_abnormal ? 'text-red-600 font-bold' : 'text-gray-400'">{{ r.is_abnormal ? '⚠' : '✓' }}</td>
                </tr>
              </tbody>
            </table>
            <button @click="editMode[item.id] = true" class="text-sm text-blue-600 hover:underline mt-2">Edit Results</button>
          </div>

          <div v-else>
            <div v-if="!resultRows[item.id]?.length">
              <button @click="initRows(item)" class="text-sm text-blue-600 hover:underline">+ Enter Results from Reference Ranges</button>
              <button @click="addRow(item.id)" class="ml-4 text-sm text-gray-600 hover:underline">+ Add Manual Row</button>
            </div>
            <div v-if="resultRows[item.id]?.length">
              <div class="grid grid-cols-5 gap-2 mb-1 text-xs text-gray-500 font-medium">
                <div>Parameter</div><div>Value</div><div>Unit</div><div>Remarks</div><div></div>
              </div>
              <div v-for="(row, ri) in resultRows[item.id]" :key="ri" class="grid grid-cols-5 gap-2 mb-2 items-center">
                <input v-model="row.parameter_name" placeholder="Parameter" class="border rounded px-2 py-1.5 text-sm" />
                <input v-model="row.observed_value" placeholder="Value"
                  :class="['border rounded px-2 py-1.5 text-sm', isAbnormal(item, row) ? 'border-red-400 bg-red-50 text-red-600 font-medium' : '']" />
                <input v-model="row.unit" placeholder="Unit" class="border rounded px-2 py-1.5 text-sm" />
                <input v-model="row.remarks" placeholder="Remarks" class="border rounded px-2 py-1.5 text-sm" />
                <button @click="resultRows[item.id].splice(ri, 1)" class="text-red-500 text-lg">×</button>
              </div>
              <button @click="addRow(item.id)" class="text-sm text-blue-600 hover:underline">+ Add Row</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div v-if="hasUnsavedRows" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <label class="text-sm font-medium text-gray-700">Entered By *</label>
          <input v-model="enteredBy" type="text" class="ml-3 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48" placeholder="Staff name" />
        </div>
        <button @click="submitResults" :disabled="submitting || !enteredBy.trim()"
          class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {{ submitting ? 'Saving...' : 'Save All Results' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getOrder, updateOrderStatus as apiUpdateStatus, submitResults as apiSubmitResults, downloadReport } from '@/api/orders'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const submitting = ref(false)
const downloading = ref(false)
const submitError = ref(null)
const enteredBy = ref('')
const orderStatus = ref('')
const resultRows = reactive({})
const editMode = reactive({})

const hasUnsavedRows = computed(() => Object.values(resultRows).some(rows => rows?.length > 0))

const getReferenceRange = (item, paramName) => {
  const r = item.test?.reference_ranges?.find(r => r.parameter_name?.toLowerCase() === paramName?.toLowerCase())
  if (!r) return '—'
  if (r.text_range) return r.text_range
  if (r.min_value != null || r.max_value != null) return `${r.min_value ?? ''} - ${r.max_value ?? ''} ${r.unit ?? ''}`
  return '—'
}

const isAbnormal = (item, row) => {
  if (!row.observed_value || !row.parameter_name) return false
  const range = item.test?.reference_ranges?.find(r => r.parameter_name?.toLowerCase() === row.parameter_name?.toLowerCase())
  if (!range) return false
  const val = parseFloat(row.observed_value)
  if (isNaN(val)) return range.text_range && row.observed_value.toLowerCase() !== range.text_range.toLowerCase()
  if (range.min_value != null && val < range.min_value) return true
  if (range.max_value != null && val > range.max_value) return true
  return false
}

const initRows = (item) => {
  const ranges = item.test?.reference_ranges ?? []
  const uniqueParams = [...new Set(ranges.map(r => r.parameter_name))]
  resultRows[item.id] = uniqueParams.length
    ? uniqueParams.map(p => { const r = ranges.find(x => x.parameter_name === p); return { order_item_id: item.id, parameter_name: p, observed_value: '', unit: r?.unit ?? '', remarks: '' } })
    : [{ order_item_id: item.id, parameter_name: '', observed_value: '', unit: '', remarks: '' }]
}

const addRow = (itemId) => {
  if (!resultRows[itemId]) resultRows[itemId] = []
  resultRows[itemId].push({ order_item_id: itemId, parameter_name: '', observed_value: '', unit: '', remarks: '' })
}

const printReport = () => {
  const patient = order.value.patient
  const items   = order.value.order_items ?? []

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
<title>Report – ${order.value.order_uid}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:11px;color:#222}
  /*
   * Top  30mm  = pre-printed header (JAY LAB logo + staff bar ~3 cm)
   * Bottom 18mm = pre-printed footer bar (~1.5 cm) + safe gap
   * Left/Right 12mm = side margins
   * These margins apply to EVERY printed page automatically.
   */
  @page{size:A4 portrait;margin:30mm 12mm 18mm 12mm}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}

  /* ── Patient bar ── */
  .pbar{background:#f5eeff;border:1px solid #c084fc;padding:8px 16px;margin:8px 0}
  .pbar table{width:100%;border-collapse:collapse}
  .pbar td{padding:2px 6px;font-size:10.5px}
  .pbar td:nth-child(odd){font-weight:bold;color:#6a0dad;width:110px}

  /* ── Test block ── */
  .test-block{margin-bottom:10px}
  .test-title{background:#7c3aed;color:#fff;padding:4px 10px;font-size:11px;font-weight:bold}
  .test-code{font-weight:normal;font-size:9px;opacity:.85}
  .rt{width:100%;border-collapse:collapse}
  .rt th{background:#ede9fe;color:#5b21b6;padding:4px 7px;text-align:left;font-size:10px;border:1px solid #ddd}
  .rt td{padding:4px 7px;border:1px solid #eee;font-size:10.5px}
  .rt tr:nth-child(even) td{background:#faf5ff}
  .abn{color:#c0392b;font-weight:bold}
  .flag{color:#c0392b;font-weight:bold}

  /* ── Footer ── */
  .ftr{margin-top:16px;border-top:2px solid #7c3aed;padding:8px 16px;display:flex;justify-content:space-between;align-items:flex-end}
  .ftr-left{font-size:9px;color:#555;line-height:1.6}
  .sig-line{width:160px;border-top:1px solid #333;text-align:center;padding-top:3px;font-size:9px}
</style></head><body>

<div class="pbar">
  <table>
    <tr>
      <td>Patient Name</td><td>${patient?.name ?? '—'}</td>
      <td>Patient ID</td><td>${patient?.patient_uid ?? '—'}</td>
      <td>Order No</td><td>${order.value.order_uid}</td>
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
  <div class="ftr-left">
    <div style="font-style:italic">* This report is computer generated. Results are for clinical reference only.</div>
  </div>
  <div><div class="sig-line">Pathologist Signature &amp; Seal</div></div>
</div>

<script>window.onload=function(){window.print()}<\/script>
</body></html>`

  const win = window.open('', '_blank', 'width=850,height=700')
  win.document.write(html)
  win.document.close()
}

const downloadPdf = async () => {
  downloading.value = true
  try {
    await downloadReport(order.value.id, order.value.order_uid)
  } catch {
    alert('Failed to download report.')
  } finally {
    downloading.value = false
  }
}

const changeStatus = async () => {
  await apiUpdateStatus(order.value.id, orderStatus.value)
  order.value.status = orderStatus.value
}

const submitResults = async () => {
  submitting.value = true
  submitError.value = null
  try {
    const allRows = Object.values(resultRows).flat().filter(r => r.parameter_name && r.observed_value)
    await apiSubmitResults(order.value.id, { entered_by: enteredBy.value, results: allRows })
    const res = await getOrder(route.params.id)
    order.value = res.data
    Object.keys(resultRows).forEach(k => { resultRows[k] = [] })
    Object.keys(editMode).forEach(k => { editMode[k] = false })
  } catch (e) {
    submitError.value = e.response?.data?.message ?? e.message
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getOrder(route.params.id)
    order.value = res.data
    orderStatus.value = res.data.status
  } finally {
    loading.value = false
  }
})
</script>
