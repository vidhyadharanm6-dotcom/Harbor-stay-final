import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 8000 })

// (c) ovvoru request-layum token attach pannum
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('harborstay-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// (f) 401 (unauthorized / expired token) vandha logout panni login page-ku anuppum
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/login')) {
      localStorage.removeItem('harborstay-token')
      localStorage.removeItem('harborstay-user')
      window.location.href = '/login?expired=1'
    }
    return Promise.reject(err)
  }
)