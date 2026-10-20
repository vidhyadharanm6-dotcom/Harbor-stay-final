import { useState } from 'react'
import RoomCard from '@exp4/components/RoomCard.jsx'
import Button from '@exp4/components/Button.jsx'
import { validateGuests, validateRoomSelected } from '@exp4/utils/validation.js'

const stepBtn =
  'w-8 h-8 rounded-full border border-harbor-200 text-harbor-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold'

// +/− control: Tab-la focus, Enter/Space-la press, screen reader-ku aria-label
function Stepper({ label, value, min, max, onChange, hint }) {
  const name = label.toLowerCase()
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <span className="text-sm text-harbor-700 font-medium">{label}</span>
      <button type="button" aria-label={`Decrease ${name}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={stepBtn}>
        −
      </button>
      <span aria-live="polite" className="w-6 text-center font-semibold text-harbor-800">{value}</span>
      <button type="button" aria-label={`Increase ${name}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={stepBtn}>
        +
      </button>
      <span className="text-xs text-harbor-500">{hint}</span>
    </div>
  )
}

export default function RoomSelection({
  availableRooms,
  selectedRoomType,
  guests,
  roomCount = 1,
  nights = 0,
  onSelectRoom,
  onUpdateGuests,
  onUpdateRoomCount,
  onUpdateNights,
  onBack,
  onProceed,
}) {
  const [errors, setErrors] = useState({})

  const handleProceed = () => {
    const next = {
      guests: validateGuests(guests),
      room: validateRoomSelected(selectedRoomType),
      days: nights > 0 ? '' : 'Please enter or select at least 1 day for your stay',
    }
    setErrors(next)
    if (Object.values(next).every((v) => !v)) onProceed()
  }

  if (availableRooms.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-harbor-100 p-8 text-center text-harbor-600">
        No rooms available.
        <div className="mt-4">
          <Button variant="ghost" onClick={onBack}>← Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-harbor-100 p-6">
      <Button variant="ghost" onClick={onBack} className="mb-4 px-0">← Back to hotel</Button>
      <h2 className="font-display text-xl text-harbor-800 mb-4">Select a room</h2>

      <div className="flex flex-wrap items-center gap-6 mb-4 p-4 bg-sand/50 rounded-lg border border-harbor-100">
        <Stepper label="Guests" value={guests} min={1} max={4} onChange={onUpdateGuests} hint="(1–4 guests)" />
        <Stepper
          label="Rooms" value={roomCount} min={1} max={3}
          onChange={(n) => onUpdateRoomCount && onUpdateRoomCount(n)} hint="(1–3 rooms)"
        />
        <Stepper
          label="Duration" value={nights || 0} min={1} max={90}
          onChange={(n) => onUpdateNights && onUpdateNights(n)}
          hint={`(${nights || 0} ${nights === 1 ? 'day' : 'days'})`}
        />
      </div>
      {errors.guests && <p className="text-xs text-red-500 mb-2">{errors.guests}</p>}
      {errors.days && <p className="text-xs text-red-500 mb-4">{errors.days}</p>}

      <div className="space-y-3 mt-5">
        {availableRooms.map((room) => (
          <RoomCard
            key={room.type}
            room={room}
            selected={selectedRoomType === room.type}
            onSelect={() => onSelectRoom(room.type)}
          />
        ))}
      </div>
      {errors.room && <p className="text-xs text-red-500 mt-2">{errors.room}</p>}

      <Button onClick={handleProceed} className="mt-6 w-full">
        Continue to booking summary
      </Button>
    </div>
  )
}