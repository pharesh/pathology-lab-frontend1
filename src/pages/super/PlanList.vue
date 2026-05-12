<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Plans</h1>
        <p class="text-gray-400 text-sm mt-1">Manage subscription plans</p>
      </div>
      <button @click="openNew" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        + New Plan
      </button>
    </div>

    <!-- Plan Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      <div v-for="plan in store.plans" :key="plan.id"
        class="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-white text-lg">{{ plan.name }}</h3>
            <p class="text-xs text-gray-400 mt-0.5">{{ plan.description }}</p>
          </div>
          <span :class="plan.is_active ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-gray-700 text-gray-400'"
            class="text-xs border px-2 py-0.5 rounded-full">{{ plan.is_active ? 'Active' : 'Inactive' }}</span>
        </div>
        <div class="mb-4">
          <p class="text-2xl font-bold text-white">₹{{ plan.price_monthly }}<span class="text-sm font-normal text-gray-400">/mo</span></p>
          <p class="text-xs text-gray-500">₹{{ plan.price_yearly }}/yr</p>
        </div>
        <div class="space-y-1.5 text-xs text-gray-300 flex-1 mb-4">
          <p>👥 {{ plan.max_patients ?? 'Unlimited' }} patients</p>
          <p>👤 {{ plan.max_users ?? 'Unlimited' }} users</p>
          <p>📋 {{ plan.max_orders_per_month ?? 'Unlimited' }} orders/month</p>
          <p>{{ plan.has_pdf_reports ? '✅' : '❌' }} PDF Reports</p>
        </div>
        <div class="flex gap-2">
          <button @click="openEdit(plan)" class="flex-1 text-xs border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 py-1.5 rounded-lg transition-colors">Edit</button>
          <button @click="remove(plan)" class="text-xs border border-red-800 text-red-400 hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors">Del</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg p-6">
        <h3 class="text-lg font-bold text-white mb-5">{{ editing ? 'Edit Plan' : 'New Plan' }}</h3>
        <div v-if="formError" class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ formError }}</div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-400 mb-1">Plan Name *</label>
            <input v-model="form.name" type="text" placeholder="e.g. Pro" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Slug *</label>
            <input v-model="form.slug" type="text" placeholder="e.g. pro" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <input v-model="form.description" type="text" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Monthly Price (₹) *</label>
            <input v-model="form.price_monthly" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Yearly Price (₹)</label>
            <input v-model="form.price_yearly" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Max Patients (blank=∞)</label>
            <input v-model="form.max_patients" type="number" min="1" placeholder="Unlimited" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Max Users (blank=∞)</label>
            <input v-model="form.max_users" type="number" min="1" placeholder="Unlimited" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Max Orders/Month (blank=∞)</label>
            <input v-model="form.max_orders_per_month" type="number" min="1" placeholder="Unlimited" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Sort Order</label>
            <input v-model="form.sort_order" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div class="flex items-center gap-3">
            <input v-model="form.has_pdf_reports" type="checkbox" id="pdf" class="w-4 h-4 rounded" />
            <label for="pdf" class="text-sm text-gray-300">PDF Reports</label>
          </div>
          <div class="flex items-center gap-3">
            <input v-model="form.is_active" type="checkbox" id="active" class="w-4 h-4 rounded" />
            <label for="active" class="text-sm text-gray-300">Active (visible)</label>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-5">
          <button @click="showModal = false" class="px-4 py-2 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">Cancel</button>
          <button @click="save" :disabled="saving" class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Plan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSuperAdminStore } from '@/stores/superAdminStore'

const store     = useSuperAdminStore()
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const formError = ref(null)

const emptyForm = () => ({ name: '', slug: '', description: '', price_monthly: 0, price_yearly: 0, max_patients: '', max_users: '', max_orders_per_month: '', has_pdf_reports: true, is_active: true, sort_order: 0 })
const form = ref(emptyForm())

function openNew() {
  editing.value = null
  form.value = emptyForm()
  formError.value = null
  showModal.value = true
}

function openEdit(plan) {
  editing.value = plan.id
  form.value = { ...plan, max_patients: plan.max_patients ?? '', max_users: plan.max_users ?? '', max_orders_per_month: plan.max_orders_per_month ?? '' }
  formError.value = null
  showModal.value = true
}

async function save() {
  saving.value = true
  formError.value = null
  try {
    const payload = {
      ...form.value,
      max_patients: form.value.max_patients !== '' ? Number(form.value.max_patients) : null,
      max_users: form.value.max_users !== '' ? Number(form.value.max_users) : null,
      max_orders_per_month: form.value.max_orders_per_month !== '' ? Number(form.value.max_orders_per_month) : null,
    }
    await store.savePlan(payload, editing.value)
    showModal.value = false
  } catch (e) {
    const errs = e.response?.data?.errors
    formError.value = errs ? Object.values(errs).flat().join(' · ') : (e.response?.data?.message ?? 'Failed to save.')
  } finally {
    saving.value = false
  }
}

async function remove(plan) {
  if (!confirm(`Delete plan "${plan.name}"?`)) return
  try {
    await store.removePlan(plan.id)
  } catch (e) {
    alert(e.response?.data?.message ?? 'Cannot delete this plan.')
  }
}

onMounted(() => store.fetchPlans())
</script>

