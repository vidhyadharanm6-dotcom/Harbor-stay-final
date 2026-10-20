import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { ALL_HOTELS } from '../src/experiment1/data/hotels.js'

const app = express()
app.disable('x-powered-by')
app.use(cors(), express.json({ limit: '10kb' }))
app.use((req, res, next) => setTimeout(next, 500))   // loading state theriya

const sessions = {}          // token -> { email, exp }
let reservations = []
let nextId = 1

const available = (id, inD, outD) => {
  if (!inD || !outD) return true
  let h = 0
  for (const c of `${id}-${inD}-${outD}`) h = (h * 31 + c.charCodeAt(0)) % 1000
  return h % 10 !== 0
}

// ---------- public: hotels ----------
app.get('/api/hotels', (req, res) => {
  const { location = '', checkIn, checkOut, minRating = 0, maxPrice = 99999, amenities = '' } = req.query
  const need = amenities ? amenities.split(',') : []
  const q = location.toLowerCase()
  res.json(ALL_HOTELS.filter((h) =>
    (!q || h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q)) &&
    h.rating >= +minRating && h.pricePerNight <= +maxPrice &&
    need.every((a) => h.amenities.includes(a)) &&
    available(h.id, checkIn, checkOut)))
})
app.get('/api/hotels/:id', (req, res) => {
  const h = ALL_HOTELS.find((x) => x.id === +req.params.id)
  h ? res.json(h) : res.status(404).json({ message: 'Hotel not found' })
})
app.get('/api/hotels/:id/rooms', (req, res) => {
  const h = ALL_HOTELS.find((x) => x.id === +req.params.id)
  h ? res.json(h.rooms) : res.status(404).json({ message: 'Hotel not found' })
})

// ---------- login ----------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password || password.length < 6)
    return res.status(401).json({ message: 'Invalid email or password' })
  const token = randomUUID()
  sessions[token] = { email, exp: Date.now() + 5 * 60 * 1000 }   // 5 min (demo-ku 20*1000)
  res.json({ token, user: { email } })
})

// ---------- token check ----------
const auth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const s = sessions[token]
  if (!s) return res.status(401).json({ message: 'Unauthorized' })
  if (s.exp < Date.now()) { delete sessions[token]; return res.status(401).json({ message: 'Token expired' }) }
  req.user = s
  next()
}
app.use('/api/reservations', auth)
app.use('/api/payments', auth)

// ---------- protected: payments + reservations CRUD ----------
app.post('/api/payments', (req, res) => res.json({ status: 'PAID' }))

app.get('/api/reservations', (req, res) =>
  res.json(reservations.filter((r) => r.owner === req.user.email)))

app.post('/api/reservations', (req, res) => {
  const r = { id: nextId++, owner: req.user.email, status: 'CONFIRMED', ...req.body }
  reservations.push(r)
  res.status(201).json(r)
})
app.put('/api/reservations/:id', (req, res) => {
  const r = reservations.find((x) => x.id === +req.params.id && x.owner === req.user.email)
  if (!r) return res.status(404).json({ message: 'Reservation not found' })
  Object.assign(r, req.body)
  res.json(r)
})
app.delete('/api/reservations/:id', (req, res) => {
  const before = reservations.length
  reservations = reservations.filter((x) => !(x.id === +req.params.id && x.owner === req.user.email))
  before === reservations.length ? res.status(404).json({ message: 'Reservation not found' }) : res.status(204).end()
})

app.listen(5000, () => console.log('API running on http://localhost:5000'))