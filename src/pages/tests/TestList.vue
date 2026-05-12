<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <select v-model="category" @change="load" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Categories</option>
        <option v-for="c in categories" :key="c">{{ c }}</option>
      </select>
      <RouterLink to="/tests/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
        + New Test
      </RouterLink>
    </div>

    <LoadingSpinner v-if="store.loading" />
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Code</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Test Name</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Category</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Sample</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Price (₹)</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">TAT</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in store.tests" :key="t.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ t.test_code }}</td>
            <td class="px-4 py-3 font-medium">{{ t.test_name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ t.category }}</td>
            <td class="px-4 py-3 text-gray-600 capitalize">{{ t.sample_type }}</td>
            <td class="px-4 py-3 font-semibold text-gray-700">₹{{ Number(t.price).toFixed(2) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ t.turnaround_hours }}h</td>
            <td class="px-4 py-3"><StatusBadge :status="t.is_active ? 'active' : 'inactive'" /></td>
            <td class="px-4 py-3 flex gap-2">
              <RouterLink :to="`/tests/${t.id}/edit`" class="text-blue-600 hover:underline text-xs">Edit</RouterLink>
              <button @click="confirmDelete(t)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="!store.tests.length">
            <td colspan="8" class="text-center py-8 text-gray-400">No tests found.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <ConfirmDialog :open="dialog.open" title="Delete Test" :message="`Delete ${dialog.test?.test_name}?`"
      @confirm="doDelete" @cancel="dialog.open = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useTestStore } from '@/stores/testStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const store = useTestStore()
const category = ref('')
const categories = ['Hematology', 'Biochemistry', 'Urology', 'Microbiology', 'Serology', 'Other']
const dialog = ref({ open: false, test: null })

const load = () => store.fetchTests({ category: category.value || undefined })
const confirmDelete = (t) => { dialog.value = { open: true, test: t } }
const doDelete = async () => {
  await store.removeTest(dialog.value.test.id)
  dialog.value.open = false
}

onMounted(load)
</script>
