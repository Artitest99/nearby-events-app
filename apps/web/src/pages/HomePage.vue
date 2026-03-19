<template>
  <section class="space-y-5">
    <div class="space-y-2">
      <p class="text-sm font-medium uppercase tracking-wide text-sky-600">Nearby Events</p>
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Find the best events around you
      </h1>
      <div class="flex flex-wrap gap-2 text-xs sm:text-sm">
        <span class="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          Radius: {{ defaultRadiusKm }} km
        </span>
        <span class="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
          {{ preferredCategoriesText }}
        </span>
      </div>
    </div>

    <SearchPanel />
  </section>
</template>

<script lang="ts">
import SearchPanel from '@/components/search/SearchPanel.vue'
import { usePreferencesStore } from '@/stores/preferences'

export default {
  name: 'HomePage',

  components: {
    SearchPanel,
  },

  computed: {
    preferencesStore() {
      return usePreferencesStore()
    },

    defaultRadiusKm(): number {
      return this.preferencesStore.defaultRadiusKm
    },

    preferredCategoriesText(): string {
      return this.preferencesStore.preferredCategories.length
        ? this.preferencesStore.preferredCategories.join(' • ')
        : 'No preferred categories'
    },
  },
}
</script>