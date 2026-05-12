<template>
  <div class="max-w-3xl">
    <!-- Add User -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
      <h3 class="text-base font-semibold text-gray-800 mb-4">Add Team Member</h3>
      <ErrorAlert :message="formError" class="mb-3" />
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input v-model="newUser.name" type="text" placeholder="Dr. Priya Sharma"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="newUser.email" type="email" placeholder="priya@lab.com"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input v-model="newUser.password" type="password" placeholder="Min. 8 characters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
          <input v-model="newUser.password_confirmation" type="password" placeholder="Repeat password"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select v-model="newUser.role"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="staff">Staff (Lab Technician)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="addUser" :disabled="adding"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ adding ? 'Adding...' : '+ Add Member' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Users List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800">Team Members</div>
      <LoadingSpinner v-if="loading" />
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Name</th>
            <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Email</th>
            <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Role</th>
            <th class="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Joined</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-5 py-3 font-medium text-gray-800">{{ u.name }}</td>
            <td class="px-5 py-3 text-gray-500">{{ u.email }}</td>
            <td class="px-5 py-3">
              <span :class="u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                {{ u.role }}
              </span>
            </td>
            <td class="px-5 py-3 text-gray-400 text-xs">{{ formatDate(u.created_at) }}</td>
            <td class="px-5 py-3 text-right">
              <button v-if="u.id !== currentUserId" @click="remove(u)"
                class="text-red-500 hover:text-red-700 text-xs hover:underline">Remove</button>
              <span v-else class="text-xs text-gray-300">You</span>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="5" class="text-center py-8 text-gray-400">No team members yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog v-if="confirmDelete" title="Remove Member"
      :message="`Remove ${confirmDelete.name} from this lab?`"
      @confirm="confirmRemove" @cancel="confirmDelete = null" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getUsers, createUser, deleteUser } from '@/api/lab'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const auth = useAuthStore()
const currentUserId = computed(() => auth.user?.id)

const users   = ref([])
const loading = ref(true)
const adding  = ref(false)
const formError = ref(null)
const confirmDelete = ref(null)

const newUser = ref({ name: '', email: '', password: '', password_confirmation: '', role: 'staff' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'

async function load() {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res.data
  } finally {
    loading.value = false
  }
}

async function addUser() {
  adding.value = true
  formError.value = null
  try {
    await createUser(newUser.value)
    newUser.value = { name: '', email: '', password: '', password_confirmation: '', role: 'staff' }
    await load()
  } catch (e) {
    const errs = e.response?.data?.errors
    formError.value = errs ? Object.values(errs).flat().join(' · ') : (e.response?.data?.message ?? 'Failed to add user.')
  } finally {
    adding.value = false
  }
}

function remove(user) {
  confirmDelete.value = user
}

async function confirmRemove() {
  try {
    await deleteUser(confirmDelete.value.id)
    await load()
  } catch {}
  confirmDelete.value = null
}

onMounted(load)
</script>
