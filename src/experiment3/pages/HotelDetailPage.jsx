import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HotelDetail from '@exp1/components/HotelDetail.jsx'
import Loading from '@exp4/components/Loading.jsx'
import ErrorMessage from '@exp4/components/ErrorMessage.jsx'
import { fetchHotel } from '@exp1/api/hotelapi.js'
import { useBookingContext } from '@exp2/context/BookingContext.jsx'

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedHotel, pickHotel, nights, setStayDuration, searchCriteria } = useBookingContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tries, setTries] = useState(0)

  // Hotel details-ah API-la irundhu fetch pannum
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchHotel(id)
      .then((h) => !cancelled && pickHotel(h))
      .catch((e) =>
        !cancelled &&
        setError(e.response?.status === 404 ? 'Hotel not found.' : 'Could not load hotel details.')
      )
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, tries, pickHotel])

  if (loading) return <Loading text="Loading hotel…" />
  if (error || !selectedHotel) {
    return <ErrorMessage message={error || 'Hotel not found.'} onRetry={() => setTries((t) => t + 1)} />
  }

  const handleProceed = (stayData) => {
    if (stayData?.days && setStayDuration) {
      setStayDuration(stayData.days, stayData.checkIn)
    }
    navigate(`/hotel/${id}/rooms`)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <HotelDetail
        hotel={selectedHotel}
        nights={nights}
        checkIn={searchCriteria?.checkIn}
        onBack={() => navigate('/stays')}
        onProceed={handleProceed}
      />
    </div>
  )
}