import HotelCard from './HotelCard.jsx'
import Loading from '@exp4/components/Loading.jsx'
import ErrorMessage from '@exp4/components/ErrorMessage.jsx'

// Props: hotels[], loading, error, onRetry(), onSelectHotel(id)
export default function HotelList({ hotels, loading, error, onRetry, onSelectHotel }) {
  if (loading) return <Loading text="Loading available hotels…" />

  if (error) return <ErrorMessage message={error} onRetry={onRetry} />

  if (hotels.length === 0) {
    return <div className="text-center py-16 text-harbor-600">No hotels available for these dates/filters.</div>
  }

  return (
    <div className="space-y-4">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} onSelect={onSelectHotel} />
      ))}
    </div>
  )
}