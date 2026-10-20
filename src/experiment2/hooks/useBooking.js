import { useBookingStore } from '../store/bookingStore.js'

export function useBooking() {
  const s = useBookingStore()
  return { ...s, availableRooms: s.selectedHotel?.rooms || [] }
}