<template>
  <div class="max-w-lg">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">My Profile</h1>
      <p class="text-gray-400 text-sm mt-1">Update your name and password</p>
    </div>

    <div class="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
      <!-- Current info -->
      <div class="pb-4 border-b border-gray-700">
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-2">Account</p>
        <p class="text-white font-medium">{{ auth.user?.name }}</p>
        <p class="text-gray-400 text-sm font-mono">{{ auth.user?.email }}</p>
      </div>

      <div v-if="error" class="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ error }}</div>
      <div v-if="success" class="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">Profile updated successfully.</div>

      <!-- Name -->
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Display Name</label>
        <input v-model="form.name" type="text"
          class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-700 pt-4">
        <p class="text-xs text-gray-400 uppercase tracking-wide mb-3">Change Password</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Current Password</label>
            <input v-model="form.current_password" type="password" placeholder="Enter current password"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">New Password</label>
            <input v-model="form.password" type="password" placeholder="Min. 8 characters"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
            <input v-model="form.password_confirmation" type="password" placeholder="Repeat new password"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button @click="save" :disabled="saving"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { updateProfile } from '@/api/auth'

const auth = useAuthStore()

const form = ref({
  name: auth.user?.name ?? '',
  current_password: '',
  password: '',
  password_confirmation: '',
})

const saving = ref(false)
const error  = ref(null)
const success = ref(false)

async function save() {
  saving.value = true
  error.value = null
  success.value = false

  const payload = { name: form.value.name }
  if (form.value.password) {
    if (form.value.password !== form.value.password_confirmation) {
      error.value = 'New passwords do not match.'
      saving.value = false
      return
    }
    payload.current_password = form.value.current_password
    payload.password = form.value.password
    payload.password_confirmation = form.value.password_confirmation
  }

  try {
    const res = await updateProfile(payload)
    auth.user = res.data.user
    localStorage.setItem('auth_user', JSON.stringify(res.data.user))
    success.value = true
    form.value.current_password = ''
    form.value.password = ''
    form.value.password_confirmation = ''
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Failed to update profile.'
  } finally {
    saving.value = false
  }
}
</script>
