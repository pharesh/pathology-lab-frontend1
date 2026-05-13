<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">All Labs</h1>
        <p class="text-gray-400 text-sm mt-1">{{ store.labs.length }} registered labs</p>
      </div>
      <div class="flex items-center gap-3">
        <input v-model="search" type="text" placeholder="Search labs..."
          class="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        <button @click="openModal"
          class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <span class="text-base leading-none">+</span> New Lab
        </button>
      </div>
    </div>

    <!-- Labs Table -->
    <div v-if="store.loading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="bg-gray-800 rounded-xl h-16 animate-pulse"></div>
    </div>

    <div v-else class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-900">
          <tr>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Lab</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Plan</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Status</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Days Left</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Users</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Patients</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Active</th>
            <th class="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase">Joined</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lab in filtered" :key="lab.id" class="border-b border-gray-700/50 hover:bg-gray-700/30">
            <td class="px-5 py-3">
              <p class="font-medium text-white">{{ lab.name }}</p>
              <p class="text-xs text-gray-400">{{ lab.email }}</p>
            </td>
            <td class="px-5 py-3 text-gray-300 text-xs">{{ lab.subscription?.plan ?? '—' }}</td>
            <td class="px-5 py-3"><SubBadge :status="lab.subscription?.status" /></td>
            <td class="px-5 py-3 text-gray-300 text-xs">{{ lab.subscription?.days_remaining ?? '—' }}</td>
            <td class="px-5 py-3 text-gray-400 text-xs">{{ lab.users_count }}</td>
            <td class="px-5 py-3 text-gray-400 text-xs">{{ lab.patients_count }}</td>
            <td class="px-5 py-3">
              <button @click="toggle(lab)"
                :class="lab.is_active ? 'bg-green-600/20 text-green-400 border-green-700' : 'bg-red-600/20 text-red-400 border-red-700'"
                class="text-xs border px-2 py-0.5 rounded-full">
                {{ lab.is_active ? 'Active' : 'Inactive' }}
              </button>
            </td>
            <td class="px-5 py-3 text-gray-500 text-xs">{{ formatDate(lab.created_at) }}</td>
            <td class="px-5 py-3">
              <RouterLink :to="`/super/labs/${lab.id}`" class="text-indigo-400 hover:text-indigo-300 text-xs hover:underline">Manage</RouterLink>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="9" class="text-center py-10 text-gray-500">No labs found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Lab Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-white">Create New Lab</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div v-if="formError" class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ formError }}</div>

        <!-- Lab Info -->
        <p class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Lab Information</p>
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-400 mb-1">Lab Name *</label>
            <input v-model="form.lab_name" type="text" placeholder="City Diagnostics Centre"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Lab Email</label>
            <input v-model="form.lab_email" type="email" placeholder="info@lab.com"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Lab Phone</label>
            <input v-model="form.lab_phone" type="tel" placeholder="9876543210"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
        </div>

        <!-- Admin Account -->
        <p class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Admin Account</p>
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-400 mb-1">Admin Name *</label>
            <input v-model="form.admin_name" type="text" placeholder="Dr. Ramesh Kumar"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Admin Email *</label>
            <input v-model="form.admin_email" type="email" placeholder="admin@lab.com"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Password *</label>
            <input v-model="form.admin_password" type="password" placeholder="Min. 8 characters"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600" />
          </div>
        </div>

        <!-- Subscription -->
        <p class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Subscription</p>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Plan</label>
            <select v-model="form.plan_id"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Auto (Trial plan)</option>
              <option v-for="p in store.plans" :key="p.id" :value="p.id">{{ p.name }} — ₹{{ p.price_monthly }}/mo</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Status</label>
            <select v-model="form.status"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="trial">Trial (14 days)</option>
              <option value="active">Active (Paid)</option>
            </select>
          </div>
          <div v-if="form.status === 'trial'">
            <label class="block text-xs font-medium text-gray-400 mb-1">Trial Ends On</label>
            <input v-model="form.trial_ends_at" type="date"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div v-if="form.status === 'active'">
            <label class="block text-xs font-medium text-gray-400 mb-1">Period End *</label>
            <input v-model="form.current_period_end" type="date"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">Cancel</button>
          <button @click="create" :disabled="creating"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {{ creating ? 'Creating...' : 'Create Lab' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useSuperAdminStore } from '@/stores/superAdminStore'
import SubBadge from '@/components/common/SubBadge.vue'

const store  = useSuperAdminStore()
const router = useRouter()
const search = ref('')

const showModal = ref(false)
const creating  = ref(false)
const formError = ref(null)

const defaultForm = () => ({
  lab_name: '', lab_email: '', lab_phone: '',
  admin_name: '', admin_email: '', admin_password: '',
  plan_id: '', status: 'trial',
  trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  current_period_end: '',
})
const form = ref(defaultForm())

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return store.labs.filter(l => !q || l.name.toLowerCase().includes(q) || (l.email ?? '').toLowerCase().includes(q))
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'

function openModal() {
  form.value = defaultForm()
  formError.value = null
  showModal.value = true
}

async function create() {
  creating.value = true
  formError.value = null
  try {
    const res = await store.createLabEntry(form.value)
    showModal.value = false
    router.push(`/super/labs/${res.lab.id}`)
  } catch (e) {
    const errs = e.response?.data?.errors
    formError.value = errs
      ? Object.values(errs).flat().join(' · ')
      : (e.response?.data?.message ?? 'Failed to create lab.')
  } finally {
    creating.value = false
  }
}

async function toggle(lab) {
  const action = lab.is_active ? 'Deactivate' : 'Activate'
  if (!confirm(`${action} "${lab.name}"? ${lab.is_active ? 'This will block all users of this lab.' : ''}`)) return
  await store.toggleLabActive(lab.id)
}

onMounted(() => Promise.all([store.fetchLabs(), store.fetchPlans()]))
</script>
