<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-lg font-semibold text-slate-900">Pick a place on the map</p>
        <p class="text-sm text-slate-600">
          Tap or click anywhere to choose a search center.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="recenterOnSelectedPlace"
      >
        Recenter
      </button>
    </div>

    <div
      ref="mapRoot"
      class="h-[360px] overflow-hidden rounded-2xl border border-slate-200 sm:h-[420px]"
    />

    <div class="mt-3 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Selected place:
        <span class="font-medium text-slate-800">{{ selectedPlaceLabel }}</span>
      </p>

      <p v-if="loadingPlace" class="text-sky-700">Resolving place…</p>
      <p v-else-if="errorText" class="text-red-600">{{ errorText }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import { reversePlace } from '@/services/api/places'
import { useSearchStore } from '@/stores/search'

export default {
  name: 'MapPicker',

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
        : 'None selected'
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