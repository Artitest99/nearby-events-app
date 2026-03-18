<template>
  <form class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" @submit.prevent="submitSearch">
    <div class="space-y-6">
      <div>
        <p class="text-lg font-semibold text-slate-900">Search events</p>
        <p class="mt-1 text-sm text-slate-600">
          Choose a place, dates, and categories to start discovering events.
        </p>
      </div>

      <div class="grid gap-6">
        <div class="relative">
          <label for="location" class="mb-2 block text-sm font-medium text-slate-700">
            City or place
          </label>

          <input id="location" v-model.trim="locationQuery" type="text" placeholder="Search a city..."
            class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            @input="onLocationInput" @focus="showSuggestions = true" @blur="closeSuggestions" />
          <p class="mt-1 text-xs text-slate-500">
  You can type a city or choose one directly on the map below.
</p>
          <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button"
              class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isLocating" @click="useCurrentLocation">
              {{ isLocating ? 'Locating...' : 'Use current location' }}
            </button>

            <span class="self-center text-sm text-slate-500">
              Selected:
              <span class="font-medium text-slate-700">
                {{ selectedPlaceLabel }}
              </span>
            </span>
          </div>

          <div v-if="showSuggestions && filteredSuggestions.length"
            class="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <button v-for="place in filteredSuggestions" :key="place.id" type="button"
              class="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50"
              @mousedown.prevent="selectSuggestion(place)">
              {{ place.displayName }}
            </button>
          </div>

          <p v-if="isSearchingPlaces" class="mt-2 text-sm text-slate-500">
            Searching places...
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="startDate" class="mb-2 block text-sm font-medium text-slate-700">
              Start date
            </label>
            <input id="startDate" v-model="startDate" type="date"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
          </div>

          <div>
            <label for="endDate" class="mb-2 block text-sm font-medium text-slate-700">
              End date (optional)
            </label>
            <input id="endDate" v-model="endDate" type="date"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
          </div>
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between gap-4">
            <label for="radius" class="block text-sm font-medium text-slate-700">
              Search radius
            </label>
            <span class="text-sm font-medium text-slate-700">{{ radiusKm }} km</span>
          </div>

          <input id="radius" v-model.number="radiusKm" type="range" min="1" max="100" class="w-full" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Categories
          </label>

          <div class="flex flex-wrap gap-2">
            <button v-for="category in categories" :key="category" type="button"
              class="rounded-full border px-4 py-2 text-sm font-medium transition" :class="selectedCategories.includes(category)
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                " @click="toggleCategory(category)">
              {{ category }}
            </button>
          </div>
        </div>

        <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ formError }}
        </div>

        <div class="grid gap-3 sm:flex sm:flex-wrap"> <button type="submit"
            class="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700">
            Search events
          </button>

          <button type="button"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            @click="resetForm">
            Reset form
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { EVENT_CATEGORIES } from '@/constants/categories'
import { usePreferencesStore } from '@/stores/preferences'
import { useSearchStore } from '@/stores/search'
import { reversePlace, searchPlaces } from '@/services/api/places'
import type { Place } from '@/types/place'

let placesSearchTimeout: number | undefined

export default {
  name: 'SearchPanel',

  data() {
    return {
      locationQuery: '',
      startDate: '',
      endDate: '',
      radiusKm: 25,
      selectedCategories: [] as string[],
      filteredSuggestions: [] as Place[],
      showSuggestions: false,
      formError: '',
      isLocating: false,
      isSearchingPlaces: false,
    }
  },
  watch: {
    selectedPlaceValue: {
      deep: true,
      handler(newPlace) {
        this.locationQuery = newPlace ? newPlace.displayName : ''
      },
    },
  },
  computed: {
    preferencesStore() {
      return usePreferencesStore()
    },

    searchStore() {
      return useSearchStore()
    },

    categories(): string[] {
      return [...EVENT_CATEGORIES]
    },

    selectedPlaceLabel(): string {
      return this.searchStore.selectedPlace
        ? this.searchStore.selectedPlace.displayName
        : 'None selected'
    },
    selectedPlaceValue() {
      return this.searchStore.selectedPlace
    },
  },

  mounted() {
    this.initializeForm()
  },

  methods: {
    initializeForm() {
      this.locationQuery = this.searchStore.selectedPlace
        ? this.searchStore.selectedPlace.displayName
        : ''

      this.startDate = this.searchStore.startDate || this.getTodayDate()
      this.endDate = this.searchStore.endDate || ''
      this.radiusKm = this.searchStore.radiusKm || this.preferencesStore.defaultRadiusKm || 25

      if (this.searchStore.selectedCategories.length) {
        this.selectedCategories = [...this.searchStore.selectedCategories]
      } else {
        this.selectedCategories = [...this.preferencesStore.preferredCategories]
      }
    },

    getTodayDate(): string {
      const now = new Date()
      const offset = now.getTimezoneOffset() * 60000
      return new Date(now.getTime() - offset).toISOString().slice(0, 10)
    },

    onLocationInput() {
      this.searchStore.setPlace(null)
      this.formError = ''
      this.showSuggestions = true

      const query = this.locationQuery.trim()

      if (!query) {
        this.filteredSuggestions = []
        return
      }

      if (placesSearchTimeout) {
        window.clearTimeout(placesSearchTimeout)
      }

      placesSearchTimeout = window.setTimeout(async () => {
        try {
          this.isSearchingPlaces = true
          const response = await searchPlaces(query)
          this.filteredSuggestions = response.results
        } catch (error) {
          this.filteredSuggestions = []
          this.formError =
            error instanceof Error ? error.message : 'Place search failed.'
        } finally {
          this.isSearchingPlaces = false
        }
      }, 350)
    },

    closeSuggestions() {
      window.setTimeout(() => {
        this.showSuggestions = false
      }, 150)
    },

    selectSuggestion(place: Place) {
      this.searchStore.setPlace(place)
      this.locationQuery = place.displayName
      this.showSuggestions = false
      this.formError = ''
    },

    toggleCategory(category: string) {
      if (this.selectedCategories.includes(category)) {
        this.selectedCategories = this.selectedCategories.filter((item) => item !== category)
      } else {
        this.selectedCategories = [...this.selectedCategories, category]
      }
    },

    async useCurrentLocation() {
      if (!navigator.geolocation) {
        this.formError = 'Geolocation is not supported in this browser.'
        return
      }

      this.isLocating = true
      this.formError = ''

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude
            const lon = position.coords.longitude

            const response = await reversePlace(lat, lon)
            const place = response.result

            this.searchStore.setPlace(place)
            this.locationQuery = place.displayName
          } catch (error) {
            this.formError =
              error instanceof Error
                ? error.message
                : 'Unable to resolve your current location.'
          } finally {
            this.isLocating = false
          }
        },
        () => {
          this.formError = 'Unable to retrieve your current location.'
          this.isLocating = false
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      )
    },

    resetForm() {
      this.locationQuery = ''
      this.startDate = this.getTodayDate()
      this.endDate = ''
      this.radiusKm = this.preferencesStore.defaultRadiusKm || 25
      this.selectedCategories = [...this.preferencesStore.preferredCategories]
      this.filteredSuggestions = []
      this.showSuggestions = false
      this.formError = ''
      this.searchStore.setPlace(null)
    },

    submitSearch() {
      if (!this.searchStore.selectedPlace) {
        this.formError = 'Please choose a city or use your current location.'
        return
      }

      if (!this.startDate) {
        this.formError = 'Please choose a start date.'
        return
      }

      if (this.endDate && this.endDate < this.startDate) {
        this.formError = 'End date cannot be earlier than start date.'
        return
      }

      this.searchStore.setDates(this.startDate, this.endDate)
      this.searchStore.setRadius(this.radiusKm)
      this.searchStore.setSelectedCategories(this.selectedCategories)
      this.searchStore.setError(null)
      this.searchStore.clearResults()

      this.$router.push('/results')
    },
  },
}
</script>