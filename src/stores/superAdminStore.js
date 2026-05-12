import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/superadmin'
import { createLab as apiCreateLab } from '@/api/superadmin'

export const useSuperAdminStore = defineStore('superadmin', () => {
  const stats   = ref(null)
  const labs    = ref([])
  const plans   = ref([])
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      const res = await api.getSuperStats()
      stats.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchLabs() {
    loading.value = true
    try {
      const res = await api.getSuperLabs()
      labs.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchPlans() {
    const res = await api.getSuperPlans()
    plans.value = res.data
  }

  async function savePlan(data, id = null) {
    const res = id ? await api.updatePlan(id, data) : await api.createPlan(data)
    await fetchPlans()
    return res.data
  }

  async function removePlan(id) {
    await api.deletePlan(id)
    plans.value = plans.value.filter(p => p.id !== id)
  }

  async function assignSub(labId, data) {
    const res = await api.assignSubscription(labId, data)
    return res.data
  }

  async function createLabEntry(data) {
    const res = await apiCreateLab(data)
    await fetchLabs()
    return res.data
  }

  async function toggleLabActive(id) {
    const res = await api.toggleLab(id)
    const lab = labs.value.find(l => l.id === id)
    if (lab) lab.is_active = res.data.is_active
    return res.data
  }

  return { stats, labs, plans, loading, fetchStats, fetchLabs, fetchPlans, savePlan, removePlan, assignSub, toggleLabActive, createLabEntry }
})
