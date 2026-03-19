<template>
  <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-[1px] hover:shadow-md">
    <div class="flex flex-col lg:flex-row">
      <div
        v-if="event.imageUrl"
        class="h-56 w-full shrink-0 bg-slate-100 lg:h-auto lg:w-[300px] xl:w-[340px]"
      >
        <img
          :src="event.imageUrl"
          :alt="event.title"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="min-w-0 flex-1 p-5">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {{ event.category }}
            </span>

            <span
              v-if="event.distanceKm != null"
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700"
            >
              <Route class="h-3.5 w-3.5" />
              {{ event.distanceKm }} km
            </span>

            <span
              v-if="event.score != null"
              class="rounded-full bg-sky-50 px-3 py-1 text-sky-700"
            >
              {{ scorePercent }}%
            </span>

            <span
              v-if="hasGroupedOccurrences"
              class="rounded-full bg-amber-50 px-3 py-1 text-amber-700"
            >
              {{ groupedOccurrences.length }} showtimes
            </span>
          </div>

          <div class="min-w-0">
            <h3 class="text-lg font-semibold leading-tight text-slate-900">
              {{ event.title }}
            </h3>

            <p class="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
              <Clock3 class="h-4 w-4 text-slate-400" />
              {{ formattedDate }}
            </p>

            <p v-if="event.venueName" class="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
              <MapPin class="h-4 w-4 text-slate-400" />
              <span>
                {{ event.venueName }}
                <span v-if="event.city"> · {{ event.city }}</span>
              </span>
            </p>
          </div>

          <p v-if="shortDescription" class="text-sm leading-6 text-slate-600">
            {{ shortDescription }}
          </p>

          <div class="grid gap-3 sm:flex sm:flex-wrap">
            <RouterLink
              :to="`/event/${encodeURIComponent(event.providerEventId)}`"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50"
            >
              <Info class="h-4 w-4" />
              Details
            </RouterLink>

            <a
              v-if="event.externalUrl"
              :href="event.externalUrl"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-sky-700"
            >
              <ExternalLink class="h-4 w-4" />
              Open event
            </a>
          </div>

          <div
            v-if="hasGroupedOccurrences"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 text-left"
              @click="toggleOccurrences"
            >
              <div>
                <p class="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Ellipsis class="h-4 w-4 text-amber-600" />
                  {{ duplicateToggleText }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ showOccurrences ? 'Hide dates' : 'Show dates' }}
                </p>
              </div>

              <ChevronDown
                class="h-4 w-4 text-slate-500 transition duration-200"
                :class="showOccurrences ? 'rotate-180' : ''"
              />
            </button>

            <transition name="expand-fade">
              <div v-if="showOccurrences" class="mt-4 space-y-3">
                <div
                  v-for="occurrence in groupedOccurrences"
                  :key="occurrence.id"
                  class="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <p class="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Clock3 class="h-4 w-4 text-slate-400" />
                        {{ formatOccurrenceDate(occurrence.startDateTime) }}
                      </p>
                      <p class="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
                        <MapPin class="h-3.5 w-3.5 text-slate-400" />
                        {{ occurrence.venueName || 'Venue unavailable' }}
                        <span v-if="occurrence.city"> · {{ occurrence.city }}</span>
                      </p>
                    </div>

                    <div class="grid gap-2 sm:flex sm:flex-wrap">
                      <RouterLink
                        :to="`/event/${encodeURIComponent(occurrence.providerEventId)}`"
                        class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Info class="h-3.5 w-3.5" />
                        Details
                      </RouterLink>

                      <a
                        v-if="occurrence.externalUrl"
                        :href="occurrence.externalUrl"
                        target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-700"
                      >
                        <ExternalLink class="h-3.5 w-3.5" />
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronDown, Clock3, Ellipsis, ExternalLink, Info, MapPin, Route } from 'lucide-vue-next'
import type { PropType } from 'vue'
import type { EventItem } from '@/types/event'

export default {
  name: 'EventCard',

  components: {
    ChevronDown,
    Clock3,
    Ellipsis,
    ExternalLink,
    Info,
    MapPin,
    Route,
    RouterLink,
  },

  props: {
    event: {
      type: Object as PropType<EventItem>,
      required: true,
    },
  },

  data() {
    return {
      showOccurrences: false,
    }
  },

  computed: {
    formattedDate(): string {
      return this.formatOccurrenceDate(this.event.startDateTime)
    },

    shortDescription(): string {
      if (!this.event.description) return ''

      if (this.event.description.length <= 180) {
        return this.event.description
      }

      return `${this.event.description.slice(0, 177)}...`
    },

    scorePercent(): number {
      return Math.round((this.event.score || 0) * 100)
    },

    groupedOccurrences(): EventItem[] {
      return this.event.groupedOccurrences || [this.event]
    },

    hasGroupedOccurrences(): boolean {
      return this.groupedOccurrences.length > 1
    },

    duplicateToggleText(): string {
      const extraCount = this.groupedOccurrences.length - 1
      return extraCount > 0
        ? `${extraCount} more date${extraCount > 1 ? 's' : ''}`
        : '1 date'
    },
  },

  methods: {
    toggleOccurrences() {
      this.showOccurrences = !this.showOccurrences
    },

    formatOccurrenceDate(value: string): string {
      const date = new Date(value)

      if (Number.isNaN(date.getTime())) {
        return 'Date unavailable'
      }

      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    },
  },
}
</script>