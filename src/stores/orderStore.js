import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/orders'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const meta = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchOrders(params = {}) {
    loading.value = true
    try {
      const res = await api.getOrders(params)
      orders.value = res.data.data
      meta.value = res.data.meta ?? {}
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id) {
    loading.value = true
    try {
      const res = await api.getOrder(id)
      currentOrder.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function placeOrder(data) {
    loading.value = true
    error.value = null
    try {
      const res = await api.createOrder(data)
      return res.data
    } catch (e) {
      error.value = e.response?.data?.errors ?? e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { orders, currentOrder, meta, loading, error, fetchOrders, fetchOrder, placeOrder }
})
