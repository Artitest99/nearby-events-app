// src/types/preferences.ts
export interface PreferencesState {
  preferredCategories: string[]
  dislikedCategories: string[]
  defaultRadiusKm: number
  locale: string
  hasCompletedPreferencesSetup: boolean
  hideDuplicateEvents: boolean
}