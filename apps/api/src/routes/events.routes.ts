// apps/api/src/routes/events.routes.ts
import { Router } from 'express'
import { searchEvents } from '../services/events.service.js'

const router = Router()

router.post('/search', async (req, res) => {
  try {
    console.log('\n[events.routes] Incoming /api/events/search body:')
    console.log(JSON.stringify(req.body, null, 2))

    const {
      lat,
      lon,
      placeName,
      startDate,
      endDate,
      radiusKm,
      categories,
      sortBy,
    } = req.body ?? {}

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.status(400).json({ error: 'lat and lon are required numbers' })
      return
    }

    if (!startDate || typeof startDate !== 'string') {
      res.status(400).json({ error: 'startDate is required' })
      return
    }

    if (!radiusKm || !Number.isFinite(radiusKm)) {
      res.status(400).json({ error: 'radiusKm is required' })
      return
    }

    const normalizedInput = {
      lat,
      lon,
      placeName: String(placeName || ''),
      startDate,
      endDate: endDate || undefined,
      radiusKm,
      categories: Array.isArray(categories) ? categories : [],
      sortBy,
    }

    console.log('[events.routes] Normalized input:')
    console.log(JSON.stringify(normalizedInput, null, 2))

    const result = await searchEvents(normalizedInput)

    console.log('[events.routes] Normalized result meta:')
    console.log(JSON.stringify(result.meta, null, 2))
    console.log('[events.routes] Normalized results count:', result.results.length)

    if (result.results.length > 0) {
      console.log('[events.routes] First normalized result:')
      console.log(JSON.stringify(result.results[0], null, 2))
    }

    res.json({
      meta: {
        placeName: String(placeName || ''),
        lat,
        lon,
        startDate,
        endDate: endDate || null,
        radiusKm,
        provider: result.meta.provider,
        count: result.meta.count,
        totalElements: result.meta.totalElements,
      },
      results: result.results,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected event search error'

    console.error('[events.routes] Event search failed:')
    console.error(error)

    res.status(500).json({ error: message })
  }
})

export default router