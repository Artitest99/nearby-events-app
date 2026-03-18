// apps/api/src/providers/ticketmaster/ticketmaster.service.ts
import { env } from '../../utils/env.js'
import {
    normalizeTicketmasterSearchResponse,
    type TicketmasterSearchResponse,
} from './ticketmaster.normalizer.js'

export interface SearchEventsInput {
    lat: number
    lon: number
    placeName: string
    startDate: string
    endDate?: string
    radiusKm: number
    categories?: string[]
    sortBy?: 'relevance' | 'distance' | 'date'
}

function toStartDateTime(date: string): string {
    return `${date}T00:00:00Z`
}

function toEndDateTime(date: string): string {
    return `${date}T23:59:59Z`
}

function mapSort(sortBy?: 'relevance' | 'distance' | 'date'): string {
    if (sortBy === 'distance') return 'distance,asc'
    if (sortBy === 'date') return 'date,asc'
    return 'date,asc'
}

function mapCategoryToTicketmasterSegment(category: string): string | null {
    switch (category) {
        case 'music':
        case 'nightlife':
            return 'music'

        case 'sports':
            return 'sports'

        case 'theater':
        case 'comedy':
        case 'exhibitions':
        case 'talks':
        case 'film':
            return 'arts & theatre'

        case 'family':
        case 'outdoor':
        case 'tours':
        case 'expeditions':
        case 'festivals':
            return 'miscellaneous'

        default:
            return null
    }
}

function pickSingleSegmentFilter(categories?: string[]): string | null {
    if (!categories?.length) return null

    const uniqueSegments = [
        ...new Set(categories.map(mapCategoryToTicketmasterSegment).filter(Boolean)),
    ]

    console.log('[ticketmaster.service] Category mapping:')
    console.log(
        JSON.stringify(
            {
                categories,
                uniqueSegments,
            },
            null,
            2,
        ),
    )

    if (uniqueSegments.length === 1) {
        return uniqueSegments[0] as string
    }

    return null
}

export async function searchTicketmasterEvents(input: SearchEventsInput) {
    if (!env.ticketmasterApiKey) {
        throw new Error('Missing TICKETMASTER_API_KEY in backend .env')
    }

    console.log('\n[ticketmaster.service] searchTicketmasterEvents input:')
    console.log(JSON.stringify(input, null, 2))

    const url = new URL('events.json', env.ticketmasterBaseUrl)
    url.searchParams.set('apikey', env.ticketmasterApiKey)
    url.searchParams.set('latlong', `${input.lat},${input.lon}`)
    url.searchParams.set('radius', String(input.radiusKm))
    url.searchParams.set('unit', 'km')
    url.searchParams.set('startDateTime', toStartDateTime(input.startDate))
    url.searchParams.set('size', '100')
    url.searchParams.set('sort', mapSort(input.sortBy))

    if (input.endDate) {
        url.searchParams.set('endDateTime', toEndDateTime(input.endDate))
    }

    const classificationName = pickSingleSegmentFilter(input.categories)
    if (classificationName) {
        url.searchParams.set('classificationName', classificationName)
    }

    const safeUrl = new URL(url.toString())
    safeUrl.searchParams.set('apikey', 'REDACTED')

    console.log('[ticketmaster.service] Final Ticketmaster URL:')
    console.log(safeUrl.toString())

    console.log('[ticketmaster.service] Final query params:')
    console.log(
        JSON.stringify(
            {
                latlong: `${input.lat},${input.lon}`,
                radius: input.radiusKm,
                unit: 'km',
                startDateTime: toStartDateTime(input.startDate),
                endDateTime: input.endDate ? toEndDateTime(input.endDate) : undefined,
                size: 24,
                sort: mapSort(input.sortBy),
                source: 'ticketmaster',
                classificationName,
            },
            null,
            2,
        ),
    )

    const response = await fetch(url.toString())

    console.log('[ticketmaster.service] HTTP status:', response.status)

    if (!response.ok) {
        const text = await response.text()
        console.error('[ticketmaster.service] Non-OK response body:')
        console.error(text)
        throw new Error(`Ticketmaster search failed (${response.status}): ${text}`)
    }

    const payload = (await response.json()) as TicketmasterSearchResponse

    const rawEvents = payload._embedded?.events || []

    console.log('[ticketmaster.service] Raw payload page:')
    console.log(JSON.stringify(payload.page, null, 2))

    console.log('[ticketmaster.service] Raw events count:', rawEvents.length)

    if (rawEvents.length > 0) {
        console.log('[ticketmaster.service] First raw event summary:')
        console.log(
            JSON.stringify(
                {
                    id: rawEvents[0].id,
                    name: rawEvents[0].name,
                    distance: rawEvents[0].distance,
                    units: rawEvents[0].units,
                    start: rawEvents[0].dates?.start,
                    classifications: rawEvents[0].classifications,
                    venue: rawEvents[0]._embedded?.venues?.[0],
                },
                null,
                2,
            ),
        )
    } else {
        console.log('[ticketmaster.service] No raw events returned from Ticketmaster.')
    }

    const normalized = normalizeTicketmasterSearchResponse(payload)

    console.log('[ticketmaster.service] Normalized meta:')
    console.log(JSON.stringify(normalized.meta, null, 2))
    console.log('[ticketmaster.service] Normalized results count:', normalized.results.length)

    return normalized
}