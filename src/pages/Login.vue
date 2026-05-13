<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo / Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4">
          <span class="text-3xl">🔬</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Pathology Lab</h1>
        <p class="text-blue-200 text-sm mt-1">Management System</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-xl font-bold text-gray-800 mb-1">Sign In</h2>
        <p class="text-gray-500 text-sm mb-6">Enter your credentials to continue</p>

        <form @submit.prevent="submit" novalidate>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              placeholder="admin@pathlab.com"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-400': error }"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                :class="{ 'border-red-400': error }"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- <p class="text-center text-xs text-gray-400 mt-6">
          Default: admin@pathlab.com / password
        </p> -->

        <!-- <div class="border-t border-gray-100 mt-6 pt-5 text-center">
          <p class="text-sm text-gray-500">
            New lab?
            <RouterLink to="/register" class="text-blue-600 hover:underline font-medium">Create your account</RouterLink>
          </p>
        </div> -->
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

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref(null)
const showPassword = ref(false)

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    await auth.login(form.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Login failed. Check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
