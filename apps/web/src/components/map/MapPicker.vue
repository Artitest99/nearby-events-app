<template>
  <div
    :class="embedded ? 'rounded-2xl border border-slate-200 bg-white/70 p-3' : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MapPinned class="h-4 w-4 text-sky-600" />
          Map
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Tap to set the search center.
        </p>
      </div>

      <button type="button"
        class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50"
        @click="recenterOnSelectedPlace">
        <Crosshair class="h-4 w-4 text-sky-600" />
        Recenter
      </button>
    </div>

    <div ref="mapRoot" class="h-[300px] overflow-hidden rounded-2xl border border-slate-200 sm:h-[360px]" />

    <div class="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-[260px_auto] sm:items-start sm:justify-between">
      <div class="min-w-0 w-full sm:w-[260px] sm:max-w-[260px]">
        <p class="break-words whitespace-normal leading-5 text-slate-800" :title="selectedPlaceLabel">
          <span class="font-medium">Selected place:</span>
          {{ selectedPlaceLabel }}
        </p>
      </div>

      <p v-if="loadingPlace" class="text-sky-700 sm:text-right">Resolving…</p>
      <p v-else-if="errorText" class="text-red-600 sm:text-right">{{ errorText }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import { Crosshair, MapPinned } from 'lucide-vue-next'
import { reversePlace } from '@/services/api/places'
import { useSearchStore } from '@/stores/search'

export default {
  name: 'MapPicker',

  components: {
    Crosshair,
    MapPinned,
  },

  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      map: null as L.Map | null,
      tileLayer: null as L.TileLayer | null,
      selectedLayer: null as L.CircleMarker | null,
      loadingPlace: false,
      errorText: '',
    }
  },

  computed: {
    searchStore() {
      return useSearchStore()
    },

    selectedPlace() {
      return this.searchStore.selectedPlace
    },

    selectedPlaceLabel(): string {
      return this.selectedPlace
        ? this.selectedPlace.displayName
        : 'No place selected'
    },
  },

  watch: {
    selectedPlace: {
      deep: true,
      handler() {
        this.drawSelectedPlace(false)
      },
    },
  },

  mounted() {
    this.initializeMap()
  },

  beforeUnmount() {
    const map = this.map as L.Map | null

    if (map) {
      map.remove()
      this.map = null
    }
  },

  methods: {
    initializeMap() {
      const mapElement = this.$refs.mapRoot as HTMLElement

      const initialCenter: L.LatLngExpression = this.selectedPlace
        ? [this.selectedPlace.lat, this.selectedPlace.lon]
        : [20, 0]

      const initialZoom = this.selectedPlace ? 12 : 2

      const map = L.map(mapElement, {
        zoomControl: true,
      }).setView(initialCenter, initialZoom)

      const tileLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        },
      )

      tileLayer.addTo(map)

      this.map = map
      this.tileLayer = tileLayer

      this.map.on('click', this.handleMapClick)

      this.drawSelectedPlace(false)

      this.$nextTick(() => {
        window.setTimeout(() => {
          const currentMap = this.map as L.Map | null
          if (!currentMap) return
          currentMap.invalidateSize()
        }, 0)
      })
    },

    async handleMapClick(event: L.LeafletMouseEvent) {
      try {
        this.loadingPlace = true
        this.errorText = ''

        const { lat, lng } = event.latlng
        const response = await reversePlace(lat, lng)

        this.searchStore.setPlace(response.result)
      } catch (error) {
        this.errorText =
          error instanceof Error
            ? error.message
            : 'Could not resolve that map location.'
      } finally {
        this.loadingPlace = false
      }
    },

    drawSelectedPlace(flyTo: boolean) {
      const map = this.map as L.Map | null
      if (!map) return

      if (this.selectedLayer) {
        this.selectedLayer.remove()
        this.selectedLayer = null
      }

      if (!this.selectedPlace) return

      const selectedMarker = L.circleMarker(
        [this.selectedPlace.lat, this.selectedPlace.lon],
        {
          radius: 9,
          color: '#0284c7',
          weight: 3,
          fillColor: '#38bdf8',
          fillOpacity: 0.8,
        },
      )

      selectedMarker.addTo(map)
      selectedMarker.bindPopup(this.selectedPlace.displayName)

      this.selectedLayer = selectedMarker

      if (flyTo) {
        map.flyTo([this.selectedPlace.lat, this.selectedPlace.lon], 12)
      }
    },

    recenterOnSelectedPlace() {
      const map = this.map as L.Map | null
      if (!map || !this.selectedPlace) return

      map.flyTo([this.selectedPlace.lat, this.selectedPlace.lon], 12)
    },
  },
}
</script>