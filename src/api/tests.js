import api from './index'

export const getTests = (params) => api.get('/tests', { params })
export const getTest = (id) => api.get(`/tests/${id}`)
export const createTest = (data) => api.post('/tests', data)
export const updateTest = (id, data) => api.put(`/tests/${id}`, data)
export const deleteTest = (id) => api.delete(`/tests/${id}`)
export const createRange = (testId, data) => api.post(`/tests/${testId}/ranges`, data)
export const updateRange = (testId, rangeId, data) => api.put(`/tests/${testId}/ranges/${rangeId}`, data)
export const deleteRange = (testId, rangeId) => api.delete(`/tests/${testId}/ranges/${rangeId}`)
