<template>
  <div class="max-w-2xl space-y-5">

    <!-- ── Lab Info Card ── -->
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

    <!-- ── Signature & Doctor Card ── -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-1">Report Signature</h3>
      <p class="text-sm text-gray-500 mb-5">This doctor name, designation and signature will appear on every printed report.</p>

      <ErrorAlert :message="sigError" class="mb-4" />
      <div v-if="sigSaved" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        Signature settings saved.
      </div>

      <!-- Doctor name + designation -->
      <form @submit.prevent="saveDoctor" class="space-y-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Doctor / Pathologist Name</label>
            <input v-model="form.doctor_name" type="text" placeholder="e.g. Dr. H. B. Shah"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Designation / Qualification</label>
            <input v-model="form.doctor_designation" type="text" placeholder="e.g. M.D. (Patho.)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div class="flex justify-end">
          <button type="submit" :disabled="saving"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Doctor Info' }}
          </button>
        </div>
      </form>

      <!-- Signature image upload -->
      <div class="border-t border-gray-100 pt-5">
        <label class="block text-sm font-medium text-gray-700 mb-3">Signature Image</label>

        <!-- Current signature preview -->
        <div v-if="currentSignatureUrl" class="mb-4 flex items-start gap-4">
          <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <img :src="currentSignatureUrl" alt="Signature" class="h-16 object-contain" />
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Current signature</p>
            <button @click="removeSig" :disabled="sigUploading"
              class="text-xs text-red-600 hover:underline disabled:opacity-40">
              Remove signature
            </button>
          </div>
        </div>

        <!-- Upload new -->
        <div class="flex items-center gap-3">
          <label class="cursor-pointer">
            <span class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white inline-block">
              {{ sigUploading ? 'Uploading...' : (currentSignatureUrl ? 'Replace Signature' : 'Upload Signature') }}
            </span>
            <input type="file" accept="image/*" class="hidden" @change="handleSigUpload" :disabled="sigUploading" />
          </label>
          <span class="text-xs text-gray-400">PNG / JPG, max 2 MB — use white or transparent background</span>
        </div>

        <!-- Preview before upload -->
        <div v-if="sigPreview" class="mt-4 flex items-start gap-4">
          <div class="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <img :src="sigPreview" alt="Preview" class="h-16 object-contain" />
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-xs text-gray-500">Preview — click Upload to save</p>
            <button @click="uploadSig"  :disabled="sigUploading"
              class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ sigUploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button @click="cancelSigPreview" class="text-xs text-gray-500 hover:underline">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Live preview of report signature block -->
      <div v-if="form.doctor_name || currentSignatureUrl" class="mt-6 border-t border-gray-100 pt-5">
        <p class="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Preview on report</p>
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 inline-block text-center min-w-40">
          <img v-if="currentSignatureUrl" :src="currentSignatureUrl" alt="sig" class="h-12 mx-auto mb-1 object-contain" />
          <div class="border-t border-gray-400 pt-1 text-xs font-semibold text-gray-700">{{ form.doctor_name || 'Doctor Name' }}</div>
          <div class="text-xs text-gray-500">{{ form.doctor_designation || 'Designation' }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLab, updateLab, uploadSignature, deleteSignature } from '@/api/lab'
import { useAuthStore } from '@/stores/authStore'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const auth  = useAuthStore()
const form  = ref({ name: '', email: '', phone: '', address: '', registration_no: '', doctor_name: '', doctor_designation: '' })
const saving    = ref(false)
const saved     = ref(false)
const error     = ref(null)
const sigError  = ref(null)
const sigSaved  = ref(false)
const sigUploading    = ref(false)
const sigPreview      = ref(null)
const sigFile         = ref(null)
const currentSignatureUrl = ref(null)

onMounted(async () => {
  const res = await getLab()
  hydrate(res.data)
})

function hydrate(lab) {
  form.value = {
    name:               lab.name ?? '',
    email:              lab.email ?? '',
    phone:              lab.phone ?? '',
    address:            lab.address ?? '',
    registration_no:    lab.registration_no ?? '',
    doctor_name:        lab.doctor_name ?? '',
    doctor_designation: lab.doctor_designation ?? '',
  }
  currentSignatureUrl.value = lab.signature_url ?? null
}

function persistLab(lab) {
  auth.lab = lab
  localStorage.setItem('auth_lab', JSON.stringify(lab))
}

async function save() {
  saving.value = true
  saved.value  = false
  error.value  = null
  try {
    const res = await updateLab({
      name: form.value.name, email: form.value.email,
      phone: form.value.phone, address: form.value.address,
      registration_no: form.value.registration_no,
    })
    persistLab(res.data)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

async function saveDoctor() {
  saving.value = true
  sigSaved.value = false
  sigError.value = null
  try {
    const res = await updateLab({
      name: form.value.name,
      doctor_name: form.value.doctor_name,
      doctor_designation: form.value.doctor_designation,
    })
    persistLab(res.data)
    sigSaved.value = true
    setTimeout(() => sigSaved.value = false, 3000)
  } catch (e) {
    sigError.value = e.response?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

function handleSigUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  sigFile.value  = file
  sigPreview.value = URL.createObjectURL(file)
  e.target.value = ''
}

function cancelSigPreview() {
  sigPreview.value = null
  sigFile.value    = null
}

async function uploadSig() {
  if (!sigFile.value) return
  sigUploading.value = true
  sigError.value     = null
  try {
    const res = await uploadSignature(sigFile.value)
    persistLab(res.data)
    currentSignatureUrl.value = res.data.signature_url
    sigPreview.value = null
    sigFile.value    = null
    sigSaved.value = true
    setTimeout(() => sigSaved.value = false, 3000)
  } catch (e) {
    sigError.value = e.response?.data?.message ?? 'Upload failed.'
  } finally {
    sigUploading.value = false
  }
}

async function removeSig() {
  if (!confirm('Remove the current signature?')) return
  sigUploading.value = true
  try {
    const res = await deleteSignature()
    persistLab(res.data)
    currentSignatureUrl.value = null
  } catch {
    sigError.value = 'Failed to remove signature.'
  } finally {
    sigUploading.value = false
  }
}
</script>
