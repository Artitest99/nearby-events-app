<template>
  <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
    <div class="flex flex-col lg:flex-row">
      <div
        v-if="event.imageUrl"
        class="h-56 w-full shrink-0 bg-slate-100 lg:h-auto lg:w-[320px] xl:w-[340px]"
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
              class="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
            >
              {{ event.distanceKm }} km away
            </span>

            <span
              v-if="event.score != null"
              class="rounded-full bg-sky-50 px-3 py-1 text-sky-700"
            >
              Score: {{ scorePercent }}%
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

            <p class="mt-1 text-sm text-slate-600">{{ formattedDate }}</p>

            <p v-if="event.venueName" class="mt-1 text-sm text-slate-600">
              {{ event.venueName }}
              <span v-if="event.city"> · {{ event.city }}</span>
            </p>
          </div>

          <p v-if="shortDescription" class="text-sm leading-6 text-slate-600">
            {{ shortDescription }}
          </p>

          <div class="grid gap-3 sm:flex sm:flex-wrap">
            <RouterLink
              :to="`/event/${encodeURIComponent(event.providerEventId)}`"
              class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Details
            </RouterLink>

            <a
              v-if="event.externalUrl"
              :href="event.externalUrl"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
            >
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
                <p class="text-sm font-semibold text-slate-900">
                  ••• {{ duplicateToggleText }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ showOccurrences ? 'Hide available dates' : 'Show all available dates' }}
                </p>
              </div>

              <span class="text-sm font-medium text-sky-700">
                {{ showOccurrences ? 'Hide' : 'Show' }}
              </span>
            </button>

            <div v-if="showOccurrences" class="mt-4 space-y-3">
              <div
                v-for="occurrence in groupedOccurrences"
                :key="occurrence.id"
                class="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-900">
                      {{ formatOccurrenceDate(occurrence.startDateTime) }}
                    </p>
                    <p class="mt-1 text-xs text-slate-500">
                      {{ occurrence.venueName || 'Venue unavailable' }}
                      <span v-if="occurrence.city"> · {{ occurrence.city }}</span>
                    </p>
                  </div>

                  <div class="grid gap-2 sm:flex sm:flex-wrap">
                    <RouterLink
                      :to="`/event/${encodeURIComponent(occurrence.providerEventId)}`"
                      class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Details
                    </RouterLink>

                    <a
                      v-if="occurrence.externalUrl"
                      :href="occurrence.externalUrl"
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex items-center justify-center rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-700"
                    >
                      Open
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'
import type { PropType } from 'vue'
import type { EventItem } from '@/types/event'

export default {
  name: 'EventCard',

  components: {
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

      if (extraCount <= 0) {
        return '1 date'
      }

      return `${extraCount} more date${extraCount > 1 ? 's' : ''}`
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