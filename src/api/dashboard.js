import api from './index'

export const getStats = () => api.get('/dashboard/stats')
