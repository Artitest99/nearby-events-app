import { defineStore } from 'pinia'

interface UiState {
  mobileFiltersOpen: boolean
  resultsViewMode: 'list' | 'map'
  selectedEventId: string | null
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    mobileFiltersOpen: false,
    resultsViewMode: 'list',
    selectedEventId: null,
  }),

  actions: {
    setMobileFiltersOpen(value: boolean) {
      this.mobileFiltersOpen = value
    },

    toggleMobileFilters() {
      this.mobileFiltersOpen = !this.mobileFiltersOpen
    },

    setResultsViewMode(mode: 'list' | 'map') {
      this.resultsViewMode = mode
    },

    setSelectedEventId(id: string | null) {
      this.selectedEventId = id
    },
  },
})