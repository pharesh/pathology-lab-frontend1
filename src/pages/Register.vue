<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-2xl mb-3">
          <span class="text-2xl">🔬</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Start Your Lab</h1>
        <p class="text-blue-200 text-sm mt-1">Create your pathology lab account</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <form @submit.prevent="submit" novalidate>
          <!-- Lab Info -->
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lab Information</p>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Lab Name *</label>
              <input v-model="form.lab_name" type="text" required placeholder="City Diagnostics Centre"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lab Email</label>
              <input v-model="form.lab_email" type="email" placeholder="info@lab.com"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lab Phone</label>
              <input v-model="form.lab_phone" type="tel" placeholder="9876543210"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Admin Account -->
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-5">Admin Account</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input v-model="form.name" type="text" required placeholder="Dr. Ramesh Kumar"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input v-model="form.email" type="email" required placeholder="you@lab.com"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input v-model="form.password" type="password" required placeholder="Min. 8 characters"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input v-model="form.password_confirmation" type="password" required placeholder="Repeat password"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div v-if="errors" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <div v-if="typeof errors === 'string'">{{ errors }}</div>
            <ul v-else class="list-disc list-inside space-y-0.5">
              <li v-for="(msgs, field) in errors" :key="field">{{ Array.isArray(msgs) ? msgs[0] : msgs }}</li>
            </ul>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full mt-6 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm">
            {{ loading ? 'Creating your lab...' : 'Create Lab & Account' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-5">
          Already have an account?
          <RouterLink to="/login" class="text-blue-600 hover:underline font-medium">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  lab_name: '', lab_email: '', lab_phone: '',
  name: '', email: '', password: '', password_confirmation: '',
})
const loading = ref(false)
const errors = ref(null)

const submit = async () => {
  loading.value = true
  errors.value = null
  try {
    await auth.register(form.value)
    router.push('/')
  } catch (e) {
    errors.value = e.response?.data?.errors ?? e.response?.data?.message ?? 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>
