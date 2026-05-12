import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/patients'

export const usePatientStore = defineStore('patients', () => {
  const patients = ref([])
  const meta = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchPatients(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.getPatients(params)
      patients.value = res.data.data
      meta.value = res.data.meta ?? {}
    } catch (e) {
      error.value = e.response?.data?.message ?? e.message
    } finally {
      loading.value = false
    }
  }

  async function savePatient(data, id = null) {
    loading.value = true
    error.value = null
    try {
      const res = id ? await api.updatePatient(id, data) : await api.createPatient(data)
      return res.data
    } catch (e) {
      error.value = e.response?.data?.errors ?? e.response?.data?.message ?? e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removePatient(id) {
    await api.deletePatient(id)
    patients.value = patients.value.filter(p => p.id !== id)
  }

  return { patients, meta, loading, error, fetchPatients, savePatient, removePatient }
})
