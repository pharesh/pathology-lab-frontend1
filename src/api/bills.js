import api from './index'

export const getBills = (params) => api.get('/bills', { params })
export const getBill = (id) => api.get(`/bills/${id}`)
export const createBill = (data) => api.post('/bills', data)
export const updateBill = (id, data) => api.patch(`/bills/${id}`, data)
export const recordPayment = (id, data) => api.patch(`/bills/${id}/payment`, data)
