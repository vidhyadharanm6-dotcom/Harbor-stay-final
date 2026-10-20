import { api } from './client.js'

// same hotel/rooms thirumba kekkum pothu API call pogaadhu, cache-la irundhu varum
const cache = new Map()
const cached = (key, request) => {
  if (!cache.has(key)) {
    cache.set(key, request().catch((e) => { cache.delete(key); throw e }))
  }
  return cache.get(key)
}

export const fetchHotels = (params) => api.get('/hotels', { params }).then((r) => r.data)
export const fetchHotel = (id) => cached(`hotel-${id}`, () => api.get(`/hotels/${id}`).then((r) => r.data))
export const fetchRooms = (id) => cached(`rooms-${id}`, () => api.get(`/hotels/${id}/rooms`).then((r) => r.data))