import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchHotels } from '@exp1/api/hotelapi.js'

export function useHotels() {
  const [searchCriteria, setSearchCriteria] = useState({ location: '', checkIn: '', checkOut: '' })
  const [filters, setFilters] = useState({ minRating: 0, maxPrice: 16000, amenities: [] })
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [customNights, setCustomNights] = useState(0)

  // Fetch hotels from API (debounced) whenever search or filters change
  useEffect(() => {
    const { location, checkIn, checkOut } = searchCriteria
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) return
    let cancelled = false
    setLoading(true)
    setError('')
    const t = setTimeout(() => {
      fetchHotels({
        location: location.trim().toLowerCase().replace('bangalore', 'bengaluru'),
        checkIn,
        checkOut,
        minRating: filters.minRating,
        maxPrice: filters.maxPrice,
        amenities: filters.amenities.join(','),
      })
        .then((d) => !cancelled && setHotels(d))
        .catch((e) => !cancelled && setError(e.response?.data?.message || 'Could not load hotels. Is the server running?'))
        .finally(() => !cancelled && setLoading(false))
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [searchCriteria, filters, reloadKey])

  const nights = useMemo(() => {
    const { checkIn, checkOut } = searchCriteria
    if (checkIn && checkOut) {
      const diff = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
      if (diff > 0) return diff
    }
    return customNights > 0 ? customNights : 0
  }, [customNights, searchCriteria.checkIn, searchCriteria.checkOut])

  const setStayDuration = useCallback((days, checkInDate) => {
    const count = Math.max(1, parseInt(days, 10) || 1)
    setCustomNights(count)

    let inStr = checkInDate || searchCriteria.checkIn
    if (!inStr) {
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      inStr = `${y}-${m}-${d}`
    }

    const [y, m, d] = inStr.split('-').map(Number)
    const startDate = new Date(y, m - 1, d)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + count)

    const pad = (n) => String(n).padStart(2, '0')
    const outStr = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`

    setSearchCriteria((prev) => ({ ...prev, checkIn: inStr, checkOut: outStr }))
  }, [searchCriteria.checkIn])

  const updateSearchField = (field, value) => setSearchCriteria((p) => ({ ...p, [field]: value }))
  const updateFilterField = (field, value) => setFilters((p) => ({ ...p, [field]: value }))

  return {
    hotels,
    loading,
    error,
    retry: () => setReloadKey((k) => k + 1),
    filteredHotels: hotels, // server already filters
    searchCriteria,
    updateSearchField,
    filters,
    updateFilterField,
    nights,
    setStayDuration,
  }
}