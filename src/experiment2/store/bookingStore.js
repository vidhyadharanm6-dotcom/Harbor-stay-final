import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sanitize } from '@exp4/utils/validation.js'


// middleware: ovvoru action-kum apram state-ah log pannum
const logger = (f) => (set, get, api) =>
  f((...a) => { set(...a); console.log('[booking]', get()) }, get, api)

export const useBookingStore = create(
  logger(
    persist(
      (set, get) => ({
        selectedHotel: null, selectedRoomType: null, guests: 1, roomCount: 1,
        checkIn: '', checkOut: '',
        customer: { name: '', email: '', phone: '' }, confirmedBooking: null, bookings: [],

        pickHotel: (h) => set({ selectedHotel: h, selectedRoomType: null }),
        selectRoom: (t) => set({ selectedRoomType: t }),
        updateGuests: (n) => set({ guests: Math.max(1, Math.min(4, n)) }),
        updateRoomCount: (n) => set({ roomCount: Math.max(1, Math.min(3, n)) }),
        updateCustomerField: (f, v) => set((s) => ({ customer: { ...s.customer, [f]: sanitize(v) } })),
        setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
        setConfirmedBooking: (b) => set({ confirmedBooking: b }),
        addBooking: (b) => set((s) => ({ bookings: [b, ...s.bookings], confirmedBooking: b })),
        clearBooking: () => set({ selectedHotel: null, selectedRoomType: null, roomCount: 1, guests: 1, confirmedBooking: null }),

        // stay duration, room cost, taxes, total
        getPricing: () => {
          const { selectedHotel: h, selectedRoomType: t, roomCount, checkIn, checkOut } = get()
          const nights = checkIn && checkOut
            ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0
          const room = h?.rooms?.find((r) => r.type === t)
          const roomCost = room ? room.price * nights * roomCount : 0
          const taxes = Math.round(roomCost * 0.1)
          return { nights, roomCost, taxes, total: roomCost + taxes }
        },
        calculateTotal: () => get().getPricing().total,
      }),
      { name: 'harborstay-booking' } // localStorage key
    )
  )
)