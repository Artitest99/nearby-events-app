// apps/api/src/routes/places.routes.ts
import { Router } from 'express'
import { reversePlace, searchPlaces } from '../services/places.service.js'

const router = Router()

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()

    if (!q) {
      res.status(400).json({
        error: 'Missing required query parameter: q',
      })
      return
    }

    const results = await searchPlaces(q)
    res.json({ results })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected places search error'

    res.status(500).json({ error: message })
  }
})

router.get('/reverse', async (req, res) => {
  try {
    const lat = Number(req.query.lat)
    const lon = Number(req.query.lon)

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      res.status(400).json({
        error: 'Missing or invalid lat/lon query parameters',
      })
      return
    }

    const result = await reversePlace(lat, lon)

    if (!result) {
      res.status(404).json({ error: 'No place found for those coordinates' })
      return
    }

    res.json({ result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected reverse geocoding error'

    res.status(500).json({ error: message })
  }
})

export default router