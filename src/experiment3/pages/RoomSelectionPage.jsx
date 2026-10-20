import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RoomSelection from '@exp1/components/RoomSelection.jsx'
import Loading from '@exp4/components/Loading.jsx'
import ErrorMessage from '@exp4/components/ErrorMessage.jsx'
import { fetchRooms } from '@exp1/api/hotelapi.js'
import { useBookingContext } from '@exp2/context/BookingContext.jsx'

export default function RoomSelectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    selectedHotel, selectedRoomType,
    guests, selectRoom, updateGuests,
    roomCount, updateRoomCount,
    nights, setStayDuration, searchCriteria,
  } = useBookingContext()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tries, setTries] = useState(0)

  // Room details-ah API-la irundhu fetch pannum
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchRooms(id)
      .then((r) => !cancelled && setRooms(r))
      .catch(() => !cancelled && setError('Could not load rooms.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, tries])

  if (!selectedHotel) {
    return <div className="max-w-6xl mx-auto px-6 py-16 text-center text-harbor-600">Please select a hotel first.</div>
  }
  if (loading) return <Loading text="Loading rooms…" />
  if (error) return <ErrorMessage message={error} onRetry={() => setTries((t) => t + 1)} />

    return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <RoomSelection
        availableRooms={rooms}
        selectedRoomType={selectedRoomType}
        guests={guests}
        roomCount={roomCount}
        nights={nights}
        checkIn={searchCriteria?.checkIn}
        checkOut={searchCriteria?.checkOut}
        onSelectRoom={selectRoom}
        onUpdateGuests={updateGuests}
        onUpdateRoomCount={updateRoomCount}
        onUpdateNights={(count) => setStayDuration(count, searchCriteria?.checkIn)}
        onBack={() => navigate(`/hotel/${id}`)}
        onProceed={() => navigate(`/hotel/${id}/guest`)}
      />
    </div>
  )
}