import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/tests'

export const useTestStore = defineStore('tests', () => {
  const tests = ref([])
  const meta = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchTests(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.getTests(params)
      tests.value = res.data.data
      meta.value = res.data.meta ?? {}
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function saveTest(data, id = null) {
    loading.value = true
    error.value = null
    try {
      const res = id ? await api.updateTest(id, data) : await api.createTest(data)
      return res.data
    } catch (e) {
      error.value = e.response?.data?.errors ?? e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeTest(id) {
    await api.deleteTest(id)
    tests.value = tests.value.filter(t => t.id !== id)
  }

  return { tests, meta, loading, error, fetchTests, saveTest, removeTest }
})
