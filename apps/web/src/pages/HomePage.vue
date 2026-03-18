<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-medium uppercase tracking-wide text-sky-600">Discover</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Find nearby upcoming events
      </h1>
      <p class="mt-3 max-w-2xl text-slate-600">
        Choose a place, set your dates, and discover concerts, sports, performances,
        exhibitions, tours, and more.
      </p>
    </div>
    <div class="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div class="space-y-6">
        <SearchPanel />
        <MapPicker />
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-lg font-semibold text-slate-900">Saved local defaults</p>

          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              <span class="font-medium text-slate-800">Default radius:</span>
              {{ defaultRadiusKm }} km
            </p>

            <p>
              <span class="font-medium text-slate-800">Preferred categories:</span>
              {{ preferredCategoriesText }}
            </p>
          </div>
        </div>
      </div>

    
    </div>
  </section>
</template>

<script lang="ts">
import MapPicker from '@/components/map/MapPicker.vue'
import SearchPanel from '@/components/search/SearchPanel.vue'
import { usePreferencesStore } from '@/stores/preferences'

export default {
  name: 'HomePage',

  components: {
    SearchPanel,
    MapPicker,
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
        ? this.preferencesStore.preferredCategories.join(', ')
        : 'none selected'
    },
  },
}
</script>