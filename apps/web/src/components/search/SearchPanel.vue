<template>
  <form
    class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(2,6,23,0.25)]"
    @submit.prevent="submitSearch">
    <div class="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-5 py-5 sm:px-6">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
            <Sparkles class="h-3.5 w-3.5" />
            Discover nearby events
          </div>

          <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            Search
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Place, dates, preferences.
          </p>
        </div>

        <div
          class="hidden min-w-0 max-w-[260px] shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 md:flex">
          <MapPinned class="h-4 w-4 shrink-0 text-sky-600" />
          <span class="truncate" :title="selectedPlaceLabel">
            {{ selectedPlaceLabel }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid gap-0 xl:grid-cols-[380px_1fr]">
      <div class="space-y-5 p-5 sm:p-6">
        <div class="space-y-2">
          <label for="location" class="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPinned class="h-4 w-4 text-sky-600" />
            Place
          </label>

          <div class="relative">
            <input id="location" v-model.trim="locationQuery" type="text" placeholder="Search a city" maxlength="120"
              class="w-full min-w-0 max-w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:text-sm"
              @input="onLocationInput" @focus="showSuggestions = true" @blur="closeSuggestions" />

            <div v-if="showSuggestions && filteredSuggestions.length"
              class="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <button v-for="place in filteredSuggestions" :key="place.id" type="button"
                class="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 last:border-b-0"
                @mousedown.prevent="selectSuggestion(place)">
                {{ place.displayName }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isLocating" @click="useCurrentLocation">
              <LocateFixed class="h-4 w-4 text-sky-600" />
              {{ isLocating ? 'Locating…' : 'Use my location' }}
            </button>

            <span v-if="isSearchingPlaces" class="text-xs text-slate-500">
              Searching…
            </span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label for="startDate" class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarDays class="h-4 w-4 text-sky-600" />
              Start
            </label>
            <input id="startDate" v-model="startDate" type="date"
              class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          </div>

          <div class="space-y-2">
            <label for="endDate" class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarRange class="h-4 w-4 text-sky-600" />
              End
            </label>
            <input id="endDate" v-model="endDate" type="date"
              class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div class="mb-3 flex items-center justify-between gap-4">
            <label for="radius" class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Route class="h-4 w-4 text-sky-600" />
              Radius
            </label>
            <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {{ radiusKm }} km
            </span>
          </div>

          <input id="radius" v-model.number="radiusKm" type="range" min="1" max="100" class="w-full accent-sky-600" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Tags class="h-4 w-4 text-sky-600" />
            Categories
          </div>

          <div class="flex flex-wrap gap-2">
            <button v-for="category in categories" :key="category" type="button"
              class="rounded-full border px-3.5 py-2 text-sm font-medium transition duration-200 hover:-translate-y-[1px]"
              :class="selectedCategories.includes(category)
                ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                " @click="toggleCategory(category)">
              {{ category }}
            </button>
          </div>
        </div>

        <div v-if="formError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ formError }}
        </div>

        <div class="grid gap-3 sm:flex sm:flex-wrap">
          <button type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-medium text-white transition duration-200 hover:bg-sky-700 hover:-translate-y-[1px]">
            <Search class="h-4 w-4" />
            Search events
          </button>

          <button type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition duration-200 hover:bg-slate-50"
            @click="resetForm">
            <RotateCcw class="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div class="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4 xl:border-l xl:border-t-0">
        <MapPicker embedded />
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {
  CalendarDays,
  CalendarRange,
  LocateFixed,
  MapPinned,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Tags,
} from 'lucide-vue-next'
import MapPicker from '@/components/map/MapPicker.vue'
import { EVENT_CATEGORIES } from '@/constants/categories'
import { usePreferencesStore } from '@/stores/preferences'
import { useSearchStore } from '@/stores/search'
import { reversePlace, searchPlaces } from '@/services/api/places'
import type { Place } from '@/types/place'

let placesSearchTimeout: number | undefined

export default {
  name: 'SearchPanel',

  components: {
    CalendarDays,
    CalendarRange,
    LocateFixed,
    MapPinned,
    MapPicker,
    RotateCcw,
    Route,
    Search,
    Sparkles,
    Tags,
  },

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
        : 'No place selected'
    },

    selectedPlaceValue() {
      return this.searchStore.selectedPlace
    },
  },

  watch: {
    selectedPlaceValue: {
      deep: true,
      handler(newPlace) {
        this.locationQuery = newPlace
          ? this.truncateAddress(newPlace.displayName)
          : ''
      },
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
      }, 300)
    },

    closeSuggestions() {
      window.setTimeout(() => {
        this.showSuggestions = false
      }, 150)
    },

    selectSuggestion(place: Place) {
      this.searchStore.setPlace(place);
      this.locationQuery = this.truncateAddress(place.displayName);
      this.showSuggestions = false;
      this.formError = '';
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
            this.locationQuery = this.truncateAddress(place.displayName)
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
    truncateAddress(value: string, maxLength = 40): string {
      if (!value) return ''

      if (value.length <= maxLength) {
        return value
      }

      return `${value.slice(0, maxLength - 1)}…`
    },
  },
}
</script>