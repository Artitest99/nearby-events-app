// src/stores/search.ts
import { defineStore } from 'pinia'
import { searchEvents as searchEventsApi } from '../services/api/event'
import { buildRankedEvents } from '@/utils/scoring'
import { usePreferencesStore } from '@/stores/preferences'
import type { EventItem, EventSearchResponse } from '@/types/event'
import type { Place } from '@/types/place'

interface SearchState {
  selectedPlace: Place | null
  startDate: string
  endDate: string
  radiusKm: number
  selectedCategories: string[]
  sortBy: 'relevance' | 'distance' | 'date'
  rawResults: EventItem[]
  results: EventItem[]
  loading: boolean
  error: string | null
  lastMeta: EventSearchResponse['meta'] | null
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    selectedPlace: null,
    startDate: '',
    endDate: '',
    radiusKm: 25,
    selectedCategories: [],
    sortBy: 'relevance',
    rawResults: [],
    results: [],
    loading: false,
    error: null,
    lastMeta: null,
  }),

  actions: {
    setPlace(place: Place | null) {
      this.selectedPlace = place
    },

    setDates(startDate: string, endDate = '') {
      this.startDate = startDate
      this.endDate = endDate
      this.applyFrontendRanking()
    },

    setRadius(radiusKm: number) {
      this.radiusKm = radiusKm
      this.applyFrontendRanking()
    },

    setSelectedCategories(categories: string[]) {
      this.selectedCategories = categories
      this.applyFrontendRanking()
    },

    setSortBy(sortBy: 'relevance' | 'distance' | 'date') {
      this.sortBy = sortBy
      this.applyFrontendRanking()
    },

    setResults(results: EventItem[]) {
      this.rawResults = results
      this.applyFrontendRanking()
    },

    setLoading(value: boolean) {
      this.loading = value
    },

    setError(message: string | null) {
      this.error = message
    },

    clearResults() {
      this.rawResults = []
      this.results = []
      this.error = null
      this.lastMeta = null
    },

    applyFrontendRanking() {
      const preferencesStore = usePreferencesStore()

      this.results = buildRankedEvents({
        events: this.rawResults,
        selectedCategories: this.selectedCategories,
        preferredCategories: preferencesStore.preferredCategories,
        dislikedCategories: preferencesStore.dislikedCategories,
        radiusKm: this.radiusKm,
        startDate: this.startDate,
        endDate: this.endDate || undefined,
        sortBy: this.sortBy,
        hideDuplicateEvents: preferencesStore.hideDuplicateEvents,
      })

      console.log('[searchStore] Frontend ranking applied')
      console.log('[searchStore] Ranked/grouped results count:', this.results.length)

      if (this.results.length > 0) {
        console.log('[searchStore] Top ranked visible event:')
        console.log(this.results[0])
      }
    },

    async searchEvents() {
      console.log('\n[searchStore] searchEvents() called')
      console.log('[searchStore] Current state before request:')
      console.log({
        selectedPlace: this.selectedPlace,
        startDate: this.startDate,
        endDate: this.endDate,
        radiusKm: this.radiusKm,
        selectedCategories: this.selectedCategories,
        sortBy: this.sortBy,
      })

      if (!this.selectedPlace) {
        this.error = 'Please choose a location first.'
        console.warn('[searchStore] Aborting: no selectedPlace')
        return
      }

      if (!this.startDate) {
        this.error = 'Please choose a start date first.'
        console.warn('[searchStore] Aborting: no startDate')
        return
      }

      this.loading = true
      this.error = null

      try {
        const payload = {
          lat: this.selectedPlace.lat,
          lon: this.selectedPlace.lon,
          placeName: this.selectedPlace.displayName,
          startDate: this.startDate,
          endDate: this.endDate || undefined,
          radiusKm: this.radiusKm,
          categories: this.selectedCategories,
          sortBy: 'date' as const,
        }

        console.log('[searchStore] API payload:')
        console.log(payload)

        const response = await searchEventsApi(payload)

        console.log('[searchStore] API response meta:')
        console.log(response.meta)
        console.log('[searchStore] API response results count:', response.results.length)

        this.rawResults = response.results
        this.lastMeta = response.meta
        this.applyFrontendRanking()
      } catch (error) {
        this.rawResults = []
        this.results = []
        this.lastMeta = null
        this.error =
          error instanceof Error ? error.message : 'Event search failed.'

        console.error('[searchStore] searchEvents failed:')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
})