import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@exp4/components/Button.jsx'
import Loading from '@exp4/components/Loading.jsx'
import ErrorMessage from '@exp4/components/ErrorMessage.jsx'
import { getReservations, updateReservation, cancelReservation } from '@exp1/api/reservationApi.js'

export default function MyBookingsPage() {
  const [allBookings, setAllBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tries, setTries] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // GET: reservation history
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getReservations()
      .then((d) => !cancelled && setAllBookings(d))
      .catch(() => !cancelled && setError('Could not load your bookings.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [tries])

  // DELETE: cancel reservation
  const handleCancel = async (id) => {
    await cancelReservation(id)
    setAllBookings((list) => list.filter((b) => b.id !== id))
    setSelectedBooking(null)
  }

  // PUT: update reservation
  const handleUpdate = async (id, changes) => {
    const updated = await updateReservation(id, changes)
    setAllBookings((list) => list.map((b) => (b.id === id ? updated : b)))
    setSelectedBooking(updated)
  }

  if (loading) return <Loading text="Loading your bookings…" />
  if (error) return <ErrorMessage message={error} onRetry={() => setTries((t) => t + 1)} />

  if (allBookings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-harbor-100 rounded-xl p-8 shadow-sm">
          <p className="text-4xl mb-3">🏨</p>
          <h2 className="font-display text-2xl text-harbor-800 mb-2">No bookings yet</h2>
          <p className="text-sm text-harbor-600 mb-6">
            You haven&apos;t booked any stays yet. Explore our handpicked destinations and plan your next trip!
          </p>
          <Link to="/stays">
            <Button>Explore stays</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-harbor-800">My Bookings</h2>
          <p className="text-xs text-harbor-600 mt-1">
            You have {allBookings.length} confirmed {allBookings.length === 1 ? 'reservation' : 'reservations'}. Click on any card to view full details.
          </p>
        </div>
        <Link to="/stays">
          <Button variant="ghost" className="text-xs">+ Book another stay</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {allBookings.map((b, idx) => {
          const roomDisplay = b.roomCount && b.roomCount > 1 ? `${b.roomCount} rooms · ${b.roomType}` : b.roomType
          return (
            <div
              key={b.id || idx}
              onClick={() => setSelectedBooking(b)}
              className="bg-white border border-harbor-100 rounded-xl p-4 sm:p-5 hover:border-harbor-400 hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {b.hotel?.image && (
                  <img
                    src={b.hotel.image}
                    alt={b.hotel.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {b.id && (
                      <span className="text-[11px] font-mono font-medium text-brass-700 bg-brass-50 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                    )}
                    <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                      Confirmed
                    </span>
                    {b.bookingDate && (
                      <span className="text-[11px] text-harbor-400 hidden sm:inline">• {b.bookingDate}</span>
                    )}
                  </div>
                  <h3 className="font-display text-lg text-harbor-800 font-semibold">{b.hotel?.name}</h3>
                  <p className="text-xs text-harbor-600 mt-0.5">{b.hotel?.location}</p>
                  <p className="text-xs text-harbor-700 font-medium mt-1">
                    {roomDisplay} · {b.nights} night(s) · {b.guests} guest(s)
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-harbor-50">
                <div>
                  <span className="text-xs text-harbor-500 block text-left sm:text-right">Total Paid</span>
                  <span className="text-lg font-display text-harbor-800 font-bold">
                    ₹{b.totalCost?.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-brass-600 hover:text-brass-700 flex items-center gap-1"
                >
                  View Details →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

function BookingDetailsModal({ booking, onClose, onCancel, onUpdate }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const run = async (fn) => {
    setBusy(true)
    setErr('')
    try { await fn() } catch (e) { setErr(e.response?.data?.message || 'Something went wrong.') }
    setBusy(false)
  }

  const { hotel, roomType, roomCount = 1, nights, guests, checkIn, checkOut, customer, totalCost, id, bookingDate } = booking

  return (
    <div className="fixed inset-0 z-50 bg-harbor-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        <div className="bg-harbor-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl text-white">Booking Details</h3>
              <span className="text-xs bg-brass-400 text-harbor-900 font-bold px-2 py-0.5 rounded">Confirmed</span>
            </div>
            {id && <p className="text-xs text-harbor-200 font-mono mt-0.5">Booking ID: {id} {bookingDate ? `• Booked on ${bookingDate}` : ''}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-harbor-700 text-white hover:bg-harbor-600 flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold text-harbor-500 uppercase tracking-wider mb-2">Hotel Information</h4>
            <div className="flex gap-4 items-center bg-sand/40 border border-harbor-100 p-3 rounded-xl">
              {hotel?.image && (
                <img src={hotel.image} alt={hotel.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              )}
              <div>
                <h5 className="font-display text-lg text-harbor-900 font-bold">{hotel?.name}</h5>
                <p className="text-xs text-harbor-600">📍 {hotel?.location}</p>
                {hotel?.rating && (
                  <span className="inline-block text-xs bg-harbor-100 text-harbor-700 px-2 py-0.5 rounded-full mt-1">
                    ★ {hotel.rating} / 5.0
                  </span>
                )}
                {hotel?.amenities && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hotel.amenities.map((a) => (
                      <span key={a} className="text-[10px] bg-white border border-harbor-200 text-harbor-600 px-1.5 py-0.5 rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-harbor-500 uppercase tracking-wider mb-2">Room & Stay Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm bg-harbor-50/50 p-4 rounded-xl border border-harbor-100">
              <div>
                <span className="text-xs text-harbor-500 block">Room Type</span>
                <span className="font-semibold text-harbor-800">{roomType}</span>
              </div>
              <div>
                <span className="text-xs text-harbor-500 block">Number of Rooms</span>
                <span className="font-semibold text-harbor-800">{roomCount} {roomCount > 1 ? 'rooms' : 'room'}</span>
              </div>
              <div>
                <span className="text-xs text-harbor-500 block">Guests</span>
                <span className="font-semibold text-harbor-800">{guests} {guests > 1 ? 'guests' : 'guest'}</span>
              </div>
              <div>
                <span className="text-xs text-harbor-500 block">Duration</span>
                <span className="font-semibold text-harbor-800">{nights} night{nights !== 1 ? 's' : ''}</span>
              </div>
              {checkIn && (
                <div>
                  <span className="text-xs text-harbor-500 block">Check-in</span>
                  <span className="font-medium text-harbor-800">{checkIn}</span>
                </div>
              )}
              {checkOut && (
                <div>
                  <span className="text-xs text-harbor-500 block">Check-out</span>
                  <span className="font-medium text-harbor-800">{checkOut}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-harbor-500 uppercase tracking-wider mb-2">Guest Details</h4>
            <div className="bg-harbor-50/50 p-4 rounded-xl border border-harbor-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-harbor-500 text-xs">Primary Guest:</span>
                <span className="font-medium text-harbor-800">{customer?.name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-harbor-500 text-xs">Email:</span>
                <span className="font-medium text-harbor-800">{customer?.email || booking.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-harbor-500 text-xs">Phone:</span>
                <span className="font-medium text-harbor-800">{customer?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-harbor-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-harbor-500 block">Total Amount Paid</span>
                <span className="text-xs text-green-600 font-medium">✓ Inclusive of all taxes & fees</span>
              </div>
              <span className="text-2xl font-display text-harbor-800 font-bold">
                ₹{totalCost?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* update guests (PUT) + cancel (DELETE) */}
        <div className="bg-sand/30 border-t border-harbor-100 px-6 py-3">
          {err && <p className="text-xs text-red-500 mb-2">{err}</p>}
          <div className="flex items-center justify-between gap-2">
            <select
              value={guests}
              disabled={busy}
              onChange={(e) => run(() => onUpdate(id, { guests: +e.target.value }))}
              className="text-xs border border-harbor-100 rounded px-2 py-1"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => window.confirm('Cancel this booking?') && run(() => onCancel(id))}
                className="text-red-600"
              >
                Cancel booking
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}