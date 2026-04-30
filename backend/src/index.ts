import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRouter      from './routes/auth'
import streamersRouter from './routes/streamers'
import eventsRouter    from './routes/events'
import followsRouter   from './routes/follows'
import calendarRouter  from './routes/calendar'

dotenv.config()

const app  = express()
const PORT = process.env.PORT ?? 4000

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',      authRouter)
app.use('/api/streamers', streamersRouter)
app.use('/api/events',    eventsRouter)
app.use('/api/follows',   followsRouter)
app.use('/api/calendar',  calendarRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`✓ Backend running → http://localhost:${PORT}`)
})
