import api from './index'

export const getOrders = (params) => api.get('/orders', { params })
export const getOrder = (id) => api.get(`/orders/${id}`)
export const createOrder = (data) => api.post('/orders', data)
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status })
export const cancelOrder = (id) => api.delete(`/orders/${id}`)
export const submitResults = (orderId, data) => api.post(`/orders/${orderId}/results`, data)
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const downloadReport = async (orderId, orderUid) => {
  const res = await api.get(`/orders/${orderId}/report`, { responseType: 'blob' })
  triggerDownload(res.data, `report-${orderUid ?? orderId}.pdf`)
}

export const downloadInvoice = async (orderId, orderUid) => {
  const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' })
  triggerDownload(res.data, `invoice-${orderUid ?? orderId}.pdf`)
}
