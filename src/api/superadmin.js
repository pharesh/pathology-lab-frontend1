import api from './index'

// Stats & Labs
export const getSuperStats  = ()        => api.get('/super/stats')
export const getSuperLabs   = ()        => api.get('/super/labs')
export const getSuperLab    = (id)      => api.get(`/super/labs/${id}`)
export const createLab      = (data)    => api.post('/super/labs', data)
export const toggleLab      = (id)      => api.patch(`/super/labs/${id}/toggle`)

// Subscriptions
export const assignSubscription = (labId, data) => api.post(`/super/labs/${labId}/subscription`, data)

// Plans
export const getSuperPlans  = ()            => api.get('/super/plans')
export const createPlan     = (data)        => api.post('/super/plans', data)
export const updatePlan     = (id, data)    => api.patch(`/super/plans/${id}`, data)
export const deletePlan     = (id)          => api.delete(`/super/plans/${id}`)

// Lab-facing subscription status
export const getMySubStatus = () => api.get('/subscription/status')
