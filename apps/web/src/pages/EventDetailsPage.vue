<template>
  <section class="space-y-6">
    <div v-if="event">
      <p class="text-sm font-medium uppercase tracking-wide text-sky-600">Event</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {{ event.title }}
      </h1>
      <p class="mt-3 text-slate-600">{{ formattedDate }}</p>
    </div>

    <div v-if="!event" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-lg font-semibold text-slate-900">Event not found</p>
      <p class="mt-2 text-slate-600">
        Open this page from the results list after running a search.
      </p>

      <RouterLink to="/"
        class="mt-4 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700">
        Back to search
      </RouterLink>
    </div>

    <template v-else>
      <div v-if="event.imageUrl" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img :src="event.imageUrl" :alt="event.title" class="h-auto w-full object-cover" />
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="space-y-4 text-slate-700">
          <p><span class="font-medium text-slate-900">Category:</span> {{ event.category }}</p>
          <p v-if="event.venueName">
            <span class="font-medium text-slate-900">Venue:</span> {{ event.venueName }}
          </p>
          <p v-if="event.venueAddress">
            <span class="font-medium text-slate-900">Address:</span> {{ event.venueAddress }}
          </p>
          <p v-if="event.city">
            <span class="font-medium text-slate-900">City:</span> {{ event.city }}
          </p>
          <p v-if="event.country">
            <span class="font-medium text-slate-900">Country:</span> {{ event.country }}
          </p>
          <p v-if="event.distanceKm != null">
            <span class="font-medium text-slate-900">Distance:</span> {{ event.distanceKm }} km
          </p>
          <p v-if="event.description">
            <span class="font-medium text-slate-900">Description:</span> {{ event.description }}
          </p>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <a v-if="event.externalUrl" :href="event.externalUrl" target="_blank" rel="noreferrer"
            class="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700">
            Open event
          </a>

          <RouterLink to="/results"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
            Back to results
          </RouterLink>
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import type { EventItem } from '@/types/event'

export default {
  name: 'EventDetailsPage',

  components: {
    RouterLink,
  },

  computed: {
    searchStore() {
      return useSearchStore()
    },

    eventId(): string {
      return String(this.$route.params.id || '')
    },

    event(): EventItem | undefined {
      return this.searchStore.rawResults.find(
        (item) => item.providerEventId === this.eventId,
      )
    },

    formattedDate(): string {
      if (!this.event?.startDateTime) return 'Date unavailable'

      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(this.event.startDateTime))
    },
  },
}
</script>