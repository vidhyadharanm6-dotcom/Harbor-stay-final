import { api } from './client.js'

export const getReservations   = () => api.get('/reservations').then((r) => r.data)
export const createReservation = (data) => api.post('/reservations', data).then((r) => r.data)
export const updateReservation = (id, data) => api.put(`/reservations/${id}`, data).then((r) => r.data)
export const cancelReservation = (id) => api.delete(`/reservations/${id}`)
export const makePayment = (amount) => api.post('/payments', { amount }).then((r) => r.data)