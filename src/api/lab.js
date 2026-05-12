import api from './index'

export const getLab = () => api.get('/lab')
export const updateLab = (data) => api.patch('/lab', data)

export const getUsers = () => api.get('/users')
export const createUser = (data) => api.post('/users', data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
