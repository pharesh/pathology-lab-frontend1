<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-5">Create New Order</h3>
      <ErrorAlert :message="error" class="mb-4" />

      <!-- Patient Search -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
        <div v-if="!selectedPatient">
          <input v-model="patientSearch" @input="searchPatients" type="text" placeholder="Search by name or phone..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div v-if="patientResults.length" class="mt-1 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <button v-for="p in patientResults" :key="p.id" type="button" @click="selectPatient(p)"
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0">
              <span class="font-medium">{{ p.name }}</span>
              <span class="text-gray-500 ml-2">{{ p.patient_uid }} | {{ p.phone }}</span>
            </button>
          </div>
        </div>
        <div v-else class="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-2.5">
          <div>
            <span class="font-medium text-sm">{{ selectedPatient.name }}</span>
            <span class="text-gray-500 text-sm ml-2">{{ selectedPatient.patient_uid }} | {{ selectedPatient.age }} {{ selectedPatient.age_unit }} | {{ selectedPatient.gender }}</span>
          </div>
          <button @click="selectedPatient = null" class="text-sm text-red-500 hover:underline">Change</button>
        </div>
      </div>

      <!-- Test Selection -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">Select Tests *</label>
        <input v-model="testSearch" type="text" placeholder="Filter tests..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div class="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
          <div v-for="t in filteredTests" :key="t.id"
            @click="toggleTest(t)"
            :class="['flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer border-b border-gray-100 last:border-0',
              selectedTestIds.includes(t.id) ? 'bg-blue-50' : 'hover:bg-gray-50']">
            <div>
              <span class="font-medium">{{ t.test_name }}</span>
              <span class="text-gray-500 text-xs ml-2">{{ t.category }} | {{ t.sample_type }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-semibold text-gray-700">₹{{ Number(t.price).toFixed(2) }}</span>
              <span v-if="selectedTestIds.includes(t.id)" class="text-blue-600 text-lg">✓</span>
            </div>
          </div>
          <div v-if="!filteredTests.length" class="text-center py-4 text-gray-400 text-sm">No tests found.</div>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="selectedTestIds.length" class="bg-gray-50 rounded-lg p-4 mb-5 text-sm">
        <div class="flex justify-between font-semibold text-gray-700">
          <span>{{ selectedTestIds.length }} test(s) selected</span>
          <span>Total: ₹{{ selectedTotal.toFixed(2) }}</span>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea v-model="notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" @click="$router.back()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button @click="submit" :disabled="!selectedPatient || !selectedTestIds.length || loading"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Creating...' : 'Create Order' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPatients, getPatient } from '@/api/patients'
import { getTests } from '@/api/tests'
import { createOrder } from '@/api/orders'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const router = useRouter()
const allTests = ref([])
const patientResults = ref([])
const selectedPatient = ref(null)
const selectedTestIds = ref([])
const patientSearch = ref('')
const testSearch = ref('')
const notes = ref('')
const loading = ref(false)
const error = ref(null)

const filteredTests = computed(() => {
  const s = testSearch.value.toLowerCase()
  return allTests.value.filter(t => t.is_active && (!s || t.test_name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s)))
})

const selectedTotal = computed(() =>
  allTests.value.filter(t => selectedTestIds.value.includes(t.id)).reduce((sum, t) => sum + Number(t.price), 0)
)

let searchTimer = null
const searchPatients = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (!patientSearch.value.trim()) return
    const res = await getPatients({ search: patientSearch.value })
    patientResults.value = res.data.data
  }, 300)
}

const selectPatient = (p) => { selectedPatient.value = p; patientResults.value = []; patientSearch.value = '' }
const toggleTest = (t) => {
  const idx = selectedTestIds.value.indexOf(t.id)
  if (idx >= 0) selectedTestIds.value.splice(idx, 1)
  else selectedTestIds.value.push(t.id)
}

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    const order = await createOrder({ patient_id: selectedPatient.value.id, test_ids: selectedTestIds.value, notes: notes.value })
    router.push(`/orders/${order.data.id}`)
  } catch (e) {
    error.value = e.response?.data?.errors ?? e.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const res = await getTests({ active_only: true })
  allTests.value = res.data.data

  const prefilledId = window.history.state?.patient_id
  if (prefilledId) {
    try {
      const pRes = await getPatient(prefilledId)
      selectPatient(pRes.data)
    } catch {}
  }
})
</script>
