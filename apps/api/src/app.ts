// apps/api/src/app.ts
import cors from 'cors'
import express from 'express'

import eventsRoutes from './routes/events.routes.js'
import healthRoutes from './routes/health.routes.js'
import placesRoutes from './routes/places.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/places', placesRoutes)
app.use('/api/events', eventsRoutes)

export default app