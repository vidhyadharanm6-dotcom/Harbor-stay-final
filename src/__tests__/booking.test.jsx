import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HotelCard from '@exp1/components/HotelCard.jsx'
import HotelDetail from '@exp1/components/HotelDetail.jsx'
import SearchBar from '@exp1/components/SearchBar.jsx'
import FilterPanel from '@exp1/components/FilterPanel.jsx'
import RoomSelection from '@exp1/components/RoomSelection.jsx'
import GuestDetails from '@exp1/components/GuestDetails.jsx'
import Payment from '@exp1/components/Payment.jsx'
import MyBookingsPage from '@exp3/pages/MyBookingsPage.jsx'
import { useBookingStore } from '@exp2/store/bookingStore.js'
import { getReservations, cancelReservation } from '@exp1/api/reservationApi.js'
jest.mock('@exp1/api/reservationApi.js', () => ({
  getReservations: jest.fn(),
  updateReservation: jest.fn(),
  cancelReservation: jest.fn(),
}))
const hotel = {
  id: 101, name: 'Harbor Point Suites', location: 'Chennai', rating: 4.6,
  pricePerNight: 6200, amenities: ['Pool'], image: 'a.jpg',
  rooms: [{ type: 'Deluxe', price: 6200 }],
}
// (a) hotel card + details
test('HotelCard calls onSelect with hotel id', async () => {
  const onSelect = jest.fn()
  render(<HotelCard hotel={hotel} onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button', { name: /view details/i }))
  expect(onSelect).toHaveBeenCalledWith(101)
})
test('HotelDetail shows hotel name', () => {
  render(<HotelDetail hotel={hotel} />)
  expect(screen.getByText('Harbor Point Suites')).toBeInTheDocument()
})
// (b) search + filtering
test('SearchBar needs a destination', async () => {
  const onSearch = jest.fn()
  render(<SearchBar criteria={{ location: '', checkIn: '', checkOut: '' }} onChange={jest.fn()} onSearch={onSearch} />)
  await userEvent.click(screen.getByRole('button', { name: 'Search hotels' }))
  expect(screen.getByText('This field is required')).toBeInTheDocument()
  expect(onSearch).not.toHaveBeenCalled()
})
test('FilterPanel amenity click calls onChange', async () => {
  const onChange = jest.fn()
  render(<FilterPanel filters={{ minRating: 0, maxPrice: 16000, amenities: [] }} onChange={onChange} />)
  await userEvent.click(screen.getByRole('button', { name: 'Pool' }))
  expect(onChange).toHaveBeenCalledWith('amenities', ['Pool'])
})
// (c) room selection + guest info
test('RoomSelection: cannot continue without a room', async () => {
  const onProceed = jest.fn()
  render(<RoomSelection availableRooms={hotel.rooms} guests={2} nights={3} onProceed={onProceed} onBack={jest.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /continue to booking summary/i }))
  expect(screen.getByText('Please select a room')).toBeInTheDocument()
  expect(onProceed).not.toHaveBeenCalled()
})
test('GuestDetails shows errors for an empty form', async () => {
  render(<GuestDetails customer={{ name: '', email: '', phone: '' }} onChange={jest.fn()} onBack={jest.fn()} onProceed={jest.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /continue to booking summary/i }))
  expect(screen.getByText('Email is required')).toBeInTheDocument()
})
// (d) cost calculation
test('cost = room cost + 10% tax', () => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  const s = useBookingStore.getState()
  s.pickHotel(hotel)
  s.selectRoom('Deluxe')
  s.setDates('2026-12-10', '2026-12-13') // 3 nights
  expect(useBookingStore.getState().getPricing().total).toBe(20460) // 18600 + 1860
})
// (e) confirmation + cancellation
test('Payment confirms after choosing a method', async () => {
  const onConfirm = jest.fn().mockResolvedValue()
  render(<Payment customer={{ name: 'Ravi', email: 'r@x.com' }} onBack={jest.fn()} onConfirm={onConfirm} />)
  await userEvent.click(screen.getByRole('button', { name: 'UPI' }))
  await userEvent.click(screen.getByRole('button', { name: /confirm booking/i }))
  expect(onConfirm).toHaveBeenCalledTimes(1)
})
test('cancelling a booking removes it', async () => {
  getReservations.mockResolvedValue([{ id: 1, hotel: { name: 'Harbor Point Suites' }, roomType: 'Deluxe', nights: 3, guests: 2, totalCost: 20460 }])
  cancelReservation.mockResolvedValue()
  jest.spyOn(window, 'confirm').mockReturnValue(true)
  render(<MemoryRouter><MyBookingsPage /></MemoryRouter>)
  await userEvent.click(await screen.findByText('Harbor Point Suites'))
  await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }))
  expect(cancelReservation).toHaveBeenCalledWith(1)
  expect(await screen.findByText('No bookings yet')).toBeInTheDocument()
})