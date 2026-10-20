import { createContext, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotels } from '../hooks/useHotels.js'
import { useBooking } from '../hooks/useBooking.js'
import { createReservation, makePayment } from '@exp1/api/reservationApi.js'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const navigate = useNavigate()
  const hotelsApi = useHotels()
  const bookingApi = useBooking()

  const { checkIn, checkOut } = hotelsApi.searchCriteria
  useEffect(() => {
    if (checkIn && checkOut) bookingApi.setDates(checkIn, checkOut)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut])

  const totalBookingCost = bookingApi.getPricing().total

  const selectHotel = useCallback((id) => navigate(`/hotel/${id}`), [navigate])

  // POST: server-la reservation create pannum
  const confirmBooking = useCallback(async () => {
    await makePayment(totalBookingCost)
    const saved = await createReservation({
      hotel: bookingApi.selectedHotel,
      roomType: bookingApi.selectedRoomType,
      roomCount: bookingApi.roomCount,
      nights: hotelsApi.nights,
      checkIn: hotelsApi.searchCriteria?.checkIn || '',
      checkOut: hotelsApi.searchCriteria?.checkOut || '',
      guests: bookingApi.guests,
      totalCost: totalBookingCost,
      customer: { ...bookingApi.customer },
      email: bookingApi.customer.email,
      bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    bookingApi.addBooking(saved)
    navigate('/confirmation')
  }, [bookingApi, hotelsApi.nights, hotelsApi.searchCriteria, totalBookingCost, navigate])

  const startOver = useCallback(() => {
    bookingApi.clearBooking()
    navigate('/stays')
  }, [bookingApi, navigate])

  const value = { ...hotelsApi, ...bookingApi, totalBookingCost, selectHotel, confirmBooking, startOver }
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBookingContext() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookingContext must be used inside <BookingProvider>')
  return ctx
}