<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-5">{{ isEdit ? 'Edit Test' : 'New Test' }}</h3>
      <ErrorAlert :message="store.error" class="mb-4" />
      <form @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Test Code *</label>
            <input v-model="form.test_code" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
            <input v-model="form.test_name" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input v-model="form.category" required list="categories-list" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="categories-list">
              <option v-for="c in categories" :key="c" :value="c" />
            </datalist>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sample Type *</label>
            <select v-model="form.sample_type" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="blood">Blood</option>
              <option value="urine">Urine</option>
              <option value="stool">Stool</option>
              <option value="swab">Swab</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input v-model.number="form.price" type="number" step="0.01" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">TAT (hours)</label>
            <input v-model.number="form.turnaround_hours" type="number" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div class="flex items-center gap-2 pt-5">
            <input type="checkbox" v-model="form.is_active" id="active" class="rounded" />
            <label for="active" class="text-sm text-gray-700">Active (available for orders)</label>
          </div>
        </div>

        <!-- Reference Ranges -->
        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-gray-700">Reference Ranges</h4>
            <button type="button" @click="addRange" class="text-sm text-blue-600 hover:underline">+ Add Range</button>
          </div>
          <div v-for="(r, i) in form.ranges" :key="i" class="grid grid-cols-6 gap-2 mb-2 items-end">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Parameter *</label>
              <input v-model="r.parameter_name" required class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" placeholder="e.g. Hemoglobin" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Unit</label>
              <input v-model="r.unit" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" placeholder="g/dL" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Min</label>
              <input v-model.number="r.min_value" type="number" step="any" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Max</label>
              <input v-model.number="r.max_value" type="number" step="any" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Gender</label>
              <select v-model="r.gender_filter" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs">
                <option value="all">All</option><option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
            <button type="button" @click="form.ranges.splice(i, 1)" class="text-red-500 text-lg pb-1">×</button>
          </div>
          <p v-if="!form.ranges.length" class="text-sm text-gray-400">No reference ranges added yet.</p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <button type="button" @click="$router.back()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" :disabled="store.loading" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {{ store.loading ? 'Saving...' : 'Save Test' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTestStore } from '@/stores/testStore'
import { getTest, createRange, updateRange, deleteRange } from '@/api/tests'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const route = useRoute()
const router = useRouter()
const store = useTestStore()
const isEdit = computed(() => !!route.params.id)
const categories = ['Hematology', 'Biochemistry', 'Urology', 'Microbiology', 'Serology', 'Other']

const form = ref({
  test_code: '', test_name: '', category: '', sample_type: '',
  price: '', turnaround_hours: 24, is_active: true, ranges: []
})

const addRange = () => form.value.ranges.push({ parameter_name: '', unit: '', min_value: null, max_value: null, gender_filter: 'all', age_min: null, age_max: null })

let existingRanges = []

onMounted(async () => {
  if (isEdit.value) {
    const res = await getTest(route.params.id)
    const data = res.data
    existingRanges = data.reference_ranges ?? []
    Object.assign(form.value, {
      test_code: data.test_code, test_name: data.test_name, category: data.category,
      sample_type: data.sample_type, price: data.price, turnaround_hours: data.turnaround_hours,
      is_active: data.is_active, ranges: existingRanges.map(r => ({ ...r }))
    })
  }
})

const submit = async () => {
  try {
    const testData = { test_code: form.value.test_code, test_name: form.value.test_name, category: form.value.category, sample_type: form.value.sample_type, price: form.value.price, turnaround_hours: form.value.turnaround_hours, is_active: form.value.is_active }
    const test = await store.saveTest(testData, isEdit.value ? route.params.id : null)

    if (isEdit.value) {
      for (const er of existingRanges) {
        const updated = form.value.ranges.find(r => r.id === er.id)
        if (!updated) await deleteRange(test.id, er.id)
        else await updateRange(test.id, er.id, updated)
      }
      for (const r of form.value.ranges.filter(r => !r.id)) {
        await createRange(test.id, r)
      }
    } else {
      for (const r of form.value.ranges) await createRange(test.id, r)
    }
    router.push('/tests')
  } catch {}
}
</script>
