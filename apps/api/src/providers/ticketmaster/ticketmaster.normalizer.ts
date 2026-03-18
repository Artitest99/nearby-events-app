// apps/api/src/providers/ticketmaster/ticketmaster.normalizer.ts

export interface NormalizedEvent {
  id: string
  provider: 'ticketmaster'
  providerEventId: string
  title: string
  description?: string
  category: string
  startDateTime: string
  endDateTime?: string
  venueName?: string
  venueAddress?: string
  lat?: number
  lon?: number
  city?: string
  country?: string
  imageUrl?: string
  externalUrl?: string
  ticketUrl?: string
  distanceKm?: number
  score?: number
}

interface TicketmasterImage {
  url?: string
  ratio?: string
  width?: number
  height?: number
}

interface TicketmasterVenue {
  name?: string
  address?: {
    line1?: string
  }
  city?: {
    name?: string
  }
  country?: {
    name?: string
    countryCode?: string
  }
  location?: {
    latitude?: string
    longitude?: string
  }
}

interface TicketmasterClassification {
  segment?: { name?: string }
  genre?: { name?: string }
  subGenre?: { name?: string }
}

interface TicketmasterEvent {
  id: string
  name: string
  url?: string
  info?: string
  pleaseNote?: string
  distance?: number
  units?: string
  images?: TicketmasterImage[]
  dates?: {
    start?: {
      dateTime?: string
      localDate?: string
      localTime?: string
    }
    end?: {
      dateTime?: string
    }
  }
  classifications?: TicketmasterClassification[]
  _embedded?: {
    venues?: TicketmasterVenue[]
  }
}

export interface TicketmasterSearchResponse {
  _embedded?: {
    events?: TicketmasterEvent[]
  }
  page?: {
    totalElements?: number
    size?: number
    number?: number
  }
}

function pickBestImage(images?: TicketmasterImage[]): string | undefined {
  if (!images?.length) return undefined

  const wide16x9 = images.find((image) => image.ratio === '16_9' && image.url)
  if (wide16x9?.url) return wide16x9.url

  const biggest = [...images]
    .filter((image) => image.url)
    .sort((a, b) => (b.width || 0) - (a.width || 0))[0]

  return biggest?.url
}

function inferCategory(event: TicketmasterEvent): string {
  const classification = event.classifications?.[0]
  const segment = classification?.segment?.name?.toLowerCase() || ''
  const genre = classification?.genre?.name?.toLowerCase() || ''
  const subGenre = classification?.subGenre?.name?.toLowerCase() || ''

  const text = `${segment} ${genre} ${subGenre}`

  if (text.includes('comedy')) return 'comedy'
  if (text.includes('film')) return 'film'
  if (text.includes('theatre') || text.includes('theater')) return 'theater'
  if (text.includes('sport')) return 'sports'
  if (text.includes('music')) return 'music'
  if (text.includes('family')) return 'family'
  if (text.includes('festival')) return 'festivals'
  if (text.includes('exhibit')) return 'exhibitions'
  if (text.includes('outdoor')) return 'outdoor'

  return 'other'
}

function normalizeDistanceKm(event: TicketmasterEvent): number | undefined {
  if (typeof event.distance !== 'number') return undefined

  if ((event.units || '').toLowerCase() === 'miles') {
    return Number((event.distance * 1.60934).toFixed(1))
  }

  return Number(event.distance.toFixed(1))
}

function normalizeEvent(event: TicketmasterEvent): NormalizedEvent | null {
  const venue = event._embedded?.venues?.[0]
  const startDateTime = event.dates?.start?.dateTime

  if (!event.id || !event.name || !startDateTime) {
    return null
  }

  return {
    id: `ticketmaster_${event.id}`,
    provider: 'ticketmaster',
    providerEventId: event.id,
    title: event.name,
    description: event.info || event.pleaseNote || undefined,
    category: inferCategory(event),
    startDateTime,
    endDateTime: event.dates?.end?.dateTime,
    venueName: venue?.name,
    venueAddress: venue?.address?.line1,
    lat: venue?.location?.latitude ? Number(venue.location.latitude) : undefined,
    lon: venue?.location?.longitude ? Number(venue.location.longitude) : undefined,
    city: venue?.city?.name,
    country: venue?.country?.name,
    imageUrl: pickBestImage(event.images),
    externalUrl: event.url,
    ticketUrl: event.url,
    distanceKm: normalizeDistanceKm(event),
  }
}

export function normalizeTicketmasterSearchResponse(
  payload: TicketmasterSearchResponse,
) {
  const events = payload._embedded?.events || []

  const normalized = events
    .map(normalizeEvent)
    .filter((event): event is NormalizedEvent => event !== null)

  return {
    meta: {
      provider: 'ticketmaster',
      count: normalized.length,
      totalElements: payload.page?.totalElements || normalized.length,
    },
    results: normalized,
  }
}