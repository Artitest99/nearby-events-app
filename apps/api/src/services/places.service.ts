// apps/api/src/services/places.service.ts
import { env } from '../utils/env.js'

export interface PlaceResult {
  id: string
  displayName: string
  lat: number
  lon: number
  city?: string
  country?: string
}

interface NominatimSearchItem {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    country?: string
  }
}

function mapNominatimItemToPlace(item: NominatimSearchItem): PlaceResult {
  const address = item.address || {}

  return {
    id: String(item.place_id),
    displayName: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
    city:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county,
    country: address.country,
  }
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const url = new URL('/search', env.geocodingBaseUrl)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '8')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': env.appPublicName,
      Referer: env.appPublicUrl,
    },
  })

  if (!response.ok) {
    throw new Error(`Geocoding search failed with status ${response.status}`)
  }

  const data = (await response.json()) as NominatimSearchItem[]
  return data.map(mapNominatimItemToPlace)
}

export async function reversePlace(lat: number, lon: number): Promise<PlaceResult | null> {
  const url = new URL('/reverse', env.geocodingBaseUrl)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': env.appPublicName,
      Referer: env.appPublicUrl,
    },
  })

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}`)
  }

  const data = (await response.json()) as NominatimSearchItem | { error?: string }

  if ('error' in data) {
    return null
  }

  return mapNominatimItemToPlace(data as NominatimSearchItem)
}