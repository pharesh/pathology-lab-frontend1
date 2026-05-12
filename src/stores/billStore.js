import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/bills'

export const useBillStore = defineStore('bills', () => {
  const bills = ref([])
  const currentBill = ref(null)
  const meta = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchBills(params = {}) {
    loading.value = true
    try {
      const res = await api.getBills(params)
      bills.value = res.data.data
      meta.value = res.data.meta ?? {}
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchBill(id) {
    loading.value = true
    try {
      const res = await api.getBill(id)
      currentBill.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createBill(data) {
    loading.value = true
    error.value = null
    try {
      const res = await api.createBill(data)
      return res.data
    } catch (e) {
      error.value = e.response?.data?.errors ?? e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function payBill(id, data) {
    loading.value = true
    error.value = null
    try {
      const res = await api.recordPayment(id, data)
      currentBill.value = res.data
      return res.data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { bills, currentBill, meta, loading, error, fetchBills, fetchBill, createBill, payBill }
})
