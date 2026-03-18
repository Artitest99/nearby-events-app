// src/services/api/places.ts
import { apiGet } from './client'
import type { Place } from '@/types/place'

interface PlacesSearchResponse {
  results: Place[]
}

interface ReversePlaceResponse {
  result: Place
}

export function searchPlaces(query: string): Promise<PlacesSearchResponse> {
  return apiGet<PlacesSearchResponse>(
    `/places/search?q=${encodeURIComponent(query)}`,
  )
}

export function reversePlace(lat: number, lon: number): Promise<ReversePlaceResponse> {
  return apiGet<ReversePlaceResponse>(
    `/places/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
  )
}