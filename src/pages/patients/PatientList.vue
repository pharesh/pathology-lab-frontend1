<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <input v-model="search" @input="onSearch" type="text" placeholder="Search by name, phone or ID..."
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <RouterLink to="/patients/new"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
        + New Patient
      </RouterLink>
    </div>

    <LoadingSpinner v-if="loading" />
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Patient ID</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Age / Gender</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Phone</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Referred By</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.patients" :key="p.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ p.patient_uid }}</td>
            <td class="px-4 py-3 font-medium">{{ p.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ p.age }} {{ p.age_unit }} / {{ p.gender }}</td>
            <td class="px-4 py-3 text-gray-600">{{ p.phone }}</td>
            <td class="px-4 py-3 text-gray-500">{{ p.referred_by ?? '—' }}</td>
            <td class="px-4 py-3 flex gap-2">
              <RouterLink :to="`/patients/${p.id}`" class="text-blue-600 hover:underline text-xs">View</RouterLink>
              <RouterLink :to="`/patients/${p.id}/edit`" class="text-gray-600 hover:underline text-xs">Edit</RouterLink>
              <button @click="confirmDelete(p)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="!store.patients.length">
            <td colspan="6" class="text-center py-8 text-gray-400">No patients found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog :open="dialog.open" title="Delete Patient" :message="`Delete ${dialog.patient?.name}? This cannot be undone.`"
      @confirm="doDelete" @cancel="dialog.open = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const store = usePatientStore()
const search = ref('')
const dialog = ref({ open: false, patient: null })

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.fetchPatients({ search: search.value }), 350)
}

const confirmDelete = (p) => { dialog.value = { open: true, patient: p } }
const doDelete = async () => {
  await store.removePatient(dialog.value.patient.id)
  dialog.value.open = false
}

const { loading } = store
onMounted(() => store.fetchPatients())
</script>
