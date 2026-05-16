import api from './index'

export const getLab    = ()     => api.get('/lab')
export const updateLab = (data) => api.patch('/lab', data)

export const uploadSignature = (file) => {
  const fd = new FormData()
  fd.append('signature', file)
  return api.post('/lab/signature', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const deleteSignature = () => api.delete('/lab/signature')

export const getUsers = () => api.get('/users')
export const createUser = (data) => api.post('/users', data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
