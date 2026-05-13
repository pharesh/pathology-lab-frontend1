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
        <button @click="openEditLab"
          class="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-xs px-4 py-1.5 rounded-lg transition-colors">
          Edit Lab
        </button>
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

    <!-- Team Members / Credentials -->
    <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mt-5">
      <div class="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-white">Team Members &amp; Credentials</h3>
          <p class="text-xs text-gray-400 mt-0.5">Login email is the username. Use "Set Password" to change a user's password.</p>
        </div>
        <button @click="openAddUser"
          class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors">
          + Add User
        </button>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-900">
          <tr>
            <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Name</th>
            <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Email (Username)</th>
            <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Role</th>
            <th class="text-left px-5 py-3 text-gray-400 text-xs uppercase">Joined</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in data.users" :key="u.id" class="border-b border-gray-700/50 hover:bg-gray-700/20">
            <td class="px-5 py-3 text-white font-medium">{{ u.name }}</td>
            <td class="px-5 py-3">
              <span class="font-mono text-indigo-300 text-xs bg-indigo-900/30 px-2 py-1 rounded">{{ u.email }}</span>
            </td>
            <td class="px-5 py-3">
              <span :class="u.role === 'admin' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-gray-700 text-gray-300 border-gray-600'"
                class="text-xs border px-2 py-0.5 rounded-full capitalize">{{ u.role }}</span>
            </td>
            <td class="px-5 py-3 text-gray-500 text-xs">{{ formatDate(u.created_at) }}</td>
            <td class="px-5 py-3 flex items-center gap-3">
              <button @click="openPwModal(u)" class="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">Set Password</button>
              <button @click="deleteUser(u)" class="text-xs text-red-400 hover:text-red-300 hover:underline">Remove</button>
            </td>
          </tr>
          <tr v-if="!data.users?.length">
            <td colspan="5" class="text-center py-6 text-gray-500">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Edit Lab Modal ── -->
    <div v-if="editLabModal.show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg p-6">
        <h3 class="text-base font-bold text-white mb-5">Edit Lab Details</h3>
        <div v-if="editLabModal.error" class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ editLabModal.error }}</div>
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-400 mb-1">Lab Name *</label>
            <input v-model="editLabModal.form.name" type="text"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <input v-model="editLabModal.form.email" type="email"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Phone</label>
            <input v-model="editLabModal.form.phone" type="tel"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-400 mb-1">Address</label>
            <input v-model="editLabModal.form.address" type="text"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-400 mb-1">Registration No.</label>
            <input v-model="editLabModal.form.registration_no" type="text"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="editLabModal.show = false" class="px-4 py-2 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">Cancel</button>
          <button @click="saveEditLab" :disabled="editLabModal.saving"
            class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {{ editLabModal.saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Add User Modal ── -->
    <div v-if="addUserModal.show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-6">
        <h3 class="text-base font-bold text-white mb-5">Add User to {{ data.lab.name }}</h3>
        <div v-if="addUserModal.error" class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ addUserModal.error }}</div>
        <div class="space-y-3 mb-5">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Full Name *</label>
            <input v-model="addUserModal.form.name" type="text" placeholder="Dr. Ramesh Kumar"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Email *</label>
            <input v-model="addUserModal.form.email" type="email" placeholder="user@lab.com"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Role *</label>
            <select v-model="addUserModal.form.role"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Password *</label>
            <input v-model="addUserModal.form.password" type="password" placeholder="Min. 8 characters"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="addUserModal.show = false" class="px-4 py-2 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">Cancel</button>
          <button @click="saveAddUser" :disabled="addUserModal.saving"
            class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {{ addUserModal.saving ? 'Adding...' : 'Add User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Set Password Modal ── -->
    <div v-if="pwModal.show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm p-6">
        <h3 class="text-base font-bold text-white mb-1">Set Password</h3>
        <p class="text-xs text-gray-400 mb-4">User: <span class="text-indigo-300 font-mono">{{ pwModal.user?.email }}</span></p>
        <div v-if="pwModal.error" class="mb-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{{ pwModal.error }}</div>
        <div v-if="pwModal.success" class="mb-3 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">Password updated successfully.</div>
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-400 mb-1">New Password</label>
          <input v-model="pwModal.password" type="password" placeholder="Min. 8 characters"
            class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="mb-5">
          <label class="block text-xs font-medium text-gray-400 mb-1">Confirm Password</label>
          <input v-model="pwModal.confirm" type="password" placeholder="Repeat password"
            class="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="flex justify-end gap-3">
          <button @click="pwModal.show = false" class="px-4 py-2 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">Cancel</button>
          <button @click="savePassword" :disabled="pwModal.saving"
            class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {{ pwModal.saving ? 'Saving...' : 'Update Password' }}
          </button>
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
import { getSuperLab, toggleLab, setUserPassword, updateLab, addLabUser, removeLabUser } from '@/api/superadmin'
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

// ── Edit Lab ──────────────────────────────────────────────────────────────────
const editLabModal = ref({ show: false, saving: false, error: null, form: {} })

function openEditLab() {
  editLabModal.value = {
    show: true, saving: false, error: null,
    form: {
      name: data.value.lab.name,
      email: data.value.lab.email ?? '',
      phone: data.value.lab.phone ?? '',
      address: data.value.lab.address ?? '',
      registration_no: data.value.lab.registration_no ?? '',
    },
  }
}

async function saveEditLab() {
  editLabModal.value.saving = true
  editLabModal.value.error = null
  try {
    await updateLab(data.value.lab.id, editLabModal.value.form)
    await load()
    editLabModal.value.show = false
  } catch (e) {
    const errs = e.response?.data?.errors
    editLabModal.value.error = errs
      ? Object.values(errs).flat().join(' · ')
      : (e.response?.data?.message ?? 'Failed to update lab.')
  } finally {
    editLabModal.value.saving = false
  }
}

// ── Add User ─────────────────────────────────────────────────────────────────
const addUserModal = ref({ show: false, saving: false, error: null, form: {} })

function openAddUser() {
  addUserModal.value = { show: true, saving: false, error: null, form: { name: '', email: '', role: 'admin', password: '' } }
}

async function saveAddUser() {
  addUserModal.value.saving = true
  addUserModal.value.error = null
  try {
    await addLabUser(data.value.lab.id, addUserModal.value.form)
    await load()
    addUserModal.value.show = false
  } catch (e) {
    const errs = e.response?.data?.errors
    addUserModal.value.error = errs
      ? Object.values(errs).flat().join(' · ')
      : (e.response?.data?.message ?? 'Failed to add user.')
  } finally {
    addUserModal.value.saving = false
  }
}

async function deleteUser(user) {
  if (!confirm(`Remove "${user.name}" (${user.email}) from this lab?`)) return
  try {
    await removeLabUser(data.value.lab.id, user.id)
    await load()
  } catch (e) {
    alert(e.response?.data?.message ?? 'Failed to remove user.')
  }
}

// ── Set Password ──────────────────────────────────────────────────────────────
const pwModal = ref({ show: false, user: null, password: '', confirm: '', saving: false, error: null, success: false })

function openPwModal(user) {
  pwModal.value = { show: true, user, password: '', confirm: '', saving: false, error: null, success: false }
}

async function savePassword() {
  const m = pwModal.value
  if (m.password.length < 8) { m.error = 'Password must be at least 8 characters.'; return }
  if (m.password !== m.confirm) { m.error = 'Passwords do not match.'; return }
  m.saving = true
  m.error = null
  try {
    await setUserPassword(data.value.lab.id, m.user.id, m.password)
    m.success = true
    m.password = ''
    m.confirm = ''
    setTimeout(() => { pwModal.value.show = false }, 1500)
  } catch (e) {
    m.error = e.response?.data?.message ?? 'Failed to update password.'
  } finally {
    m.saving = false
  }
}

// ── Toggle Active ─────────────────────────────────────────────────────────────
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
