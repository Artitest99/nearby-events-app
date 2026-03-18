// src/types/event.ts
export interface EventScoreBreakdown {
  category: number
  distance: number
  time: number
  quality: number
  relevance: number
}

export interface EventItem {
  id: string
  provider: string
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
  scoreBreakdown?: EventScoreBreakdown

  isGrouped?: boolean
  duplicateCount?: number
  groupedOccurrences?: EventItem[]
}

export interface EventSearchRequest {
  lat: number
  lon: number
  placeName: string
  startDate: string
  endDate?: string
  radiusKm: number
  categories?: string[]
  sortBy?: 'relevance' | 'distance' | 'date'
}

export interface EventSearchResponse {
  meta: {
    placeName: string
    lat: number
    lon: number
    startDate: string
    endDate: string | null
    radiusKm: number
    provider: string
    count: number
    totalElements: number
  }
  results: EventItem[]
}