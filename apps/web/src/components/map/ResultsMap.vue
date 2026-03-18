<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-lg font-semibold text-slate-900">Map results</p>
        <p class="text-sm text-slate-600">
          Tap a marker to preview the event.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="fitToData"
      >
        Fit markers
      </button>
    </div>

    <div
      ref="mapRoot"
      class="h-[420px] overflow-hidden rounded-2xl border border-slate-200 sm:h-[520px]"
    />
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import type { PropType } from 'vue'
import type { EventItem } from '@/types/event'
import type { Place } from '@/types/place'

export default {
  name: 'ResultsMap',

  props: {
    events: {
      type: Array as PropType<EventItem[]>,
      required: true,
    },
    selectedPlace: {
      type: Object as PropType<Place | null>,
      default: null,
    },
  },

  data() {
    return {
      map: null as L.Map | null,
      tileLayer: null as L.TileLayer | null,
      markersLayer: null as L.LayerGroup | null,
      selectedPlaceLayer: null as L.CircleMarker | null,
    }
  },

  watch: {
    events: {
      deep: true,
      handler() {
        this.renderMarkers()
      },
    },
    selectedPlace: {
      deep: true,
      handler() {
        this.renderMarkers()
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

      const initialZoom = this.selectedPlace ? 11 : 2

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

      const markersLayer = L.layerGroup()
      markersLayer.addTo(map)

      this.map = map
      this.tileLayer = tileLayer
      this.markersLayer = markersLayer

      this.renderMarkers()

      this.$nextTick(() => {
        window.setTimeout(() => {
          const currentMap = this.map as L.Map | null
          if (!currentMap) return

          currentMap.invalidateSize()
          this.fitToData()
        }, 0)
      })
    },

    renderMarkers() {
      const map = this.map as L.Map | null
      const markersLayer = this.markersLayer as L.LayerGroup | null

      if (!map || !markersLayer) return

      markersLayer.clearLayers()
      this.selectedPlaceLayer = null

      if (this.selectedPlace) {
        const selectedMarker = L.circleMarker(
          [this.selectedPlace.lat, this.selectedPlace.lon],
          {
            radius: 10,
            color: '#0284c7',
            weight: 3,
            fillColor: '#38bdf8',
            fillOpacity: 0.85,
          },
        )

        selectedMarker.addTo(markersLayer)
        selectedMarker.bindPopup(`Search center: ${this.selectedPlace.displayName}`)
        this.selectedPlaceLayer = selectedMarker
      }

      this.events.forEach((event) => {
        if (typeof event.lat !== 'number' || typeof event.lon !== 'number') return

        const marker = L.circleMarker([event.lat, event.lon], {
          radius: 7,
          color: '#b91c1c',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.8,
        })

        marker.addTo(markersLayer)

        const detailsPath = `/event/${encodeURIComponent(event.providerEventId)}`

        marker.bindPopup(`
          <div style="min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 6px;">${this.escapeHtml(event.title)}</div>
            <div style="font-size: 13px; color: #475569; margin-bottom: 4px;">
              ${this.escapeHtml(event.venueName || 'Venue unavailable')}
            </div>
            <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">
              ${this.escapeHtml(this.formatDate(event.startDateTime))}
            </div>
            <a href="${detailsPath}" style="color: #0284c7; text-decoration: none; font-weight: 600;">
              Open details
            </a>
          </div>
        `)
      })

      this.fitToData()
    },

    fitToData() {
      const map = this.map as L.Map | null
      if (!map) return

      const bounds = L.latLngBounds([])

      if (this.selectedPlace) {
        bounds.extend([this.selectedPlace.lat, this.selectedPlace.lon])
      }

      this.events.forEach((event) => {
        if (typeof event.lat === 'number' && typeof event.lon === 'number') {
          bounds.extend([event.lat, event.lon])
        }
      })

      if (!bounds.isValid()) return

      const northEast = bounds.getNorthEast()
      const southWest = bounds.getSouthWest()

      if (northEast.lat === southWest.lat && northEast.lng === southWest.lng) {
        map.setView([northEast.lat, northEast.lng], 13)
        return
      }

      map.fitBounds(bounds, {
        padding: [30, 30],
      })
    },

    formatDate(value: string): string {
      const date = new Date(value)

      if (Number.isNaN(date.getTime())) {
        return 'Date unavailable'
      }

      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    },

    escapeHtml(value: string): string {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    },
  },
}
</script>