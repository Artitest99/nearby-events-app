// src/stores/preferences.ts
import { defineStore } from 'pinia'
import type { PreferencesState } from '@/types/preferences'

export const usePreferencesStore = defineStore('preferences', {
  state: (): PreferencesState => ({
    preferredCategories: ['music', 'sports'],
    dislikedCategories: [],
    defaultRadiusKm: 25,
    locale: 'en',
    hasCompletedPreferencesSetup: false,
    hideDuplicateEvents: true,
  }),

  actions: {
    setPreferredCategories(categories: string[]) {
      this.preferredCategories = categories
    },

    setDislikedCategories(categories: string[]) {
      this.dislikedCategories = categories
    },

    setDefaultRadiusKm(radius: number) {
      this.defaultRadiusKm = radius
    },

    setLocale(locale: string) {
      this.locale = locale
    },

    setHideDuplicateEvents(value: boolean) {
      this.hideDuplicateEvents = value
    },

    markSetupComplete() {
      this.hasCompletedPreferencesSetup = true
    },

    resetPreferences() {
      this.preferredCategories = []
      this.dislikedCategories = []
      this.defaultRadiusKm = 25
      this.locale = 'en'
      this.hasCompletedPreferencesSetup = false
      this.hideDuplicateEvents = true
    },
  },

  persist: true,
})