<template>
  <div v-if="data">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <RouterLink to="/super/labs" class="text-gray-400 hover:text-white text-sm">← Labs</RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-white">{{ data.lab.name }}</h1>
        <p class="text-gray-400 text-sm">{{ data.lab.email }}{{ data.lab.phone ? ` · ${data.lab.phone}` : '' }}</p>
      </div>
      <div class="ml-auto flex items-center gap-3">
        <SubBadge :status="data.subscription?.status" />
        <button @click="toggleActive"
          :class="data.lab.is_active ? 'bg-red-900/30 text-red-400 border-red-700 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50'"
          class="border text-xs px-4 py-1.5 rounded-lg transition-colors">
          {{ data.lab.is_active ? 'Deactivate Lab' : 'Activate Lab' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-5 mb-6">
      <!-- Stats -->
      <div class="col-span-1 space-y-4">
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-3">Lab Stats</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-gray-400">Patients</span><span class="text-white font-medium">{{ data.stats?.patients ?? 0 }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Orders</span><span class="text-white font-medium">{{ data.stats?.orders ?? 0 }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Team Members</span><span class="text-white font-medium">{{ data.users?.length ?? 0 }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Registered</span><span class="text-white font-medium">{{ formatDate(data.lab.created_at) }}</span></div>
          </div>
        </div>

        <!-- Current Subscription -->
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-3">Current Subscription</p>
          <template v-if="data.subscription?.status !== 'none'">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-400">Plan</span><span class="text-white font-medium">{{ data.subscription?.plan ?? '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Status</span><SubBadge :status="data.subscription?.status" /></div>
              <div class="flex justify-between"><span class="text-gray-400">Days Remaining</span><span class="text-white font-medium">{{ data.subscription?.days_remaining ?? 0 }}</span></div>
              <div v-if="data.subscription?.current_period_end" class="flex justify-between">
                <span class="text-gray-400">Expires</span>
                <span class="text-white font-medium">{{ data.subscription?.current_period_end }}</span>
              </div>
              <div v-if="data.subscription?.trial_ends_at" class="flex justify-between">
                <span class="text-gray-400">Trial Ends</span>
                <span class="text-white font-medium">{{ data.subscription?.trial_ends_at }}</span>
              </div>
            </div>
          </template>
          <p v-else class="text-gray-500 text-sm">No subscription</p>
        </div>
      </div>

      <!-- Assign Subscription Form -->
      <div class="col-span-2">
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-5">
          <h3 class="text-base font-semibold text-white mb-4">Assign / Renew Subscription</h3>
          <div v-if="assignError" class="mb-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ assignError }}</div>
          <div v-if="assignSuccess" class="mb-3 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">Subscription updated successfully.</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Plan *</label>
              <select v-model="form.plan_id" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>Select plan</option>
                <option v-for="p in superStore.plans" :key="p.id" :value="p.id">{{ p.name }} — ₹{{ p.price_monthly }}/mo</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Status *</label>
              <select v-model="form.status" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="trial">Trial</option>
                <option value="active">Active (Paid)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div v-if="form.status === 'trial'">
              <label class="block text-xs font-medium text-gray-400 mb-1">Trial Ends At *</label>
              <input v-model="form.trial_ends_at" type="date" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div v-if="form.status === 'active'">
              <label class="block text-xs font-medium text-gray-400 mb-1">Period Start *</label>
              <input v-model="form.current_period_start" type="date" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div v-if="form.status === 'active'">
              <label class="block text-xs font-medium text-gray-400 mb-1">Period End *</label>
              <input v-model="form.current_period_end" type="date" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div v-if="form.status === 'active'">
              <label class="block text-xs font-medium text-gray-400 mb-1">Amount Paid (₹)</label>
              <input v-model="form.amount_paid" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div v-if="form.status === 'active'">
              <label class="block text-xs font-medium text-gray-400 mb-1">Payment Method</label>
              <input v-model="form.payment_method" type="text" placeholder="Bank Transfer / UPI / etc." class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-400 mb-1">Notes</label>
              <input v-model="form.notes" type="text" class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button @click="assign" :disabled="assigning"
              class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {{ assigning ? 'Saving...' : 'Assign Subscription' }}
            </button>
          </div>
        </div>

        <!-- Subscription History -->
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-700">
            <h3 class="font-semibold text-white">Subscription History</h3>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-gray-900">
              <tr>
                <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Plan</th>
                <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Status</th>
                <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Period</th>
                <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in data.sub_history" :key="sub.id" class="border-b border-gray-700/50">
                <td class="px-5 py-3 text-gray-200">{{ sub.plan?.name }}</td>
                <td class="px-5 py-3"><SubBadge :status="sub.status" /></td>
                <td class="px-5 py-3 text-gray-400 text-xs">
                  {{ sub.trial_ends_at ? `Trial → ${sub.trial_ends_at}` : `${sub.current_period_start?.slice(0,10) ?? '?'} → ${sub.current_period_end?.slice(0,10) ?? '?'}` }}
                </td>
                <td class="px-5 py-3 text-gray-300">₹{{ sub.amount_paid }}</td>
              </tr>
              <tr v-if="!data.sub_history?.length">
                <td colspan="4" class="text-center py-6 text-gray-500">No history.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-64">
    <div class="text-gray-500">Loading...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useSuperAdminStore } from '@/stores/superAdminStore'
import { getSuperLab, toggleLab } from '@/api/superadmin'
import SubBadge from '@/components/common/SubBadge.vue'

const route      = useRoute()
const superStore = useSuperAdminStore()
const data       = ref(null)
const assigning  = ref(false)
const assignError   = ref(null)
const assignSuccess = ref(false)

const form = ref({ plan_id: '', status: 'active', trial_ends_at: '', current_period_start: '', current_period_end: '', amount_paid: 0, payment_method: '', notes: '' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'

async function load() {
  const res = await getSuperLab(route.params.id)
  data.value = res.data
}

async function assign() {
  assigning.value = true
  assignError.value = null
  assignSuccess.value = false
  try {
    await superStore.assignSub(route.params.id, form.value)
    assignSuccess.value = true
    await load()
    setTimeout(() => assignSuccess.value = false, 3000)
  } catch (e) {
    assignError.value = e.response?.data?.message ?? 'Failed to assign subscription.'
  } finally {
    assigning.value = false
  }
}

async function toggleActive() {
  const isActive = data.value.lab.is_active
  if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} "${data.value.lab.name}"?${isActive ? ' This will block all users of this lab.' : ''}`)) return
  await toggleLab(data.value.lab.id)
  await load()
}

onMounted(async () => {
  await Promise.all([load(), superStore.fetchPlans()])
})
</script>
