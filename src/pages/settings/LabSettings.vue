<template>
  <div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-5">Lab Settings</h3>
      <ErrorAlert :message="error" class="mb-4" />
      <div v-if="saved" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        Settings saved successfully.
      </div>

      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lab Name *</label>
          <input v-model="form.name" required type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lab Email</label>
            <input v-model="form.email" type="email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input v-model="form.phone" type="tel"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea v-model="form.address" rows="2"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Registration / License No.</label>
          <input v-model="form.registration_no" type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="saving"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLab, updateLab } from '@/api/lab'
import { useAuthStore } from '@/stores/authStore'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const auth  = useAuthStore()
const form  = ref({ name: '', email: '', phone: '', address: '', registration_no: '' })
const saving = ref(false)
const saved  = ref(false)
const error  = ref(null)

onMounted(async () => {
  const res = await getLab()
  const lab = res.data
  form.value = {
    name: lab.name ?? '',
    email: lab.email ?? '',
    phone: lab.phone ?? '',
    address: lab.address ?? '',
    registration_no: lab.registration_no ?? '',
  }
})

async function save() {
  saving.value = true
  saved.value  = false
  error.value  = null
  try {
    const res = await updateLab(form.value)
    auth.lab = res.data
    localStorage.setItem('auth_lab', JSON.stringify(res.data))
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}
</script>
