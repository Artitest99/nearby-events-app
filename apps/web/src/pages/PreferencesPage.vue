<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-medium uppercase tracking-wide text-sky-600">Preferences</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your preferences</h1>
      <p class="mt-3 text-slate-600">
        These preferences are stored locally in your browser.
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-6">
        <div>
          <label for="radius" class="mb-2 block text-sm font-medium text-slate-700">
            Default radius (km)
          </label>
          <input
            id="radius"
            v-model.number="radius"
            type="number"
            min="1"
            max="100"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
          />
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label class="flex items-start gap-3">
            <input
              v-model="hideDuplicateEvents"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              <span class="block text-sm font-medium text-slate-900">
                Hide duplicate showtimes
              </span>
              <span class="mt-1 block text-sm text-slate-600">
                Group repeated instances of the same show into a single card with expandable dates.
              </span>
            </span>
          </label>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Preferred categories
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              @click="toggleCategory(category)"
              class="rounded-full border px-4 py-2 text-sm font-medium transition"
              :class="
                selectedCategories.includes(category)
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              "
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            @click="savePreferences"
            class="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700"
          >
            Save preferences
          </button>

          <button
            type="button"
            @click="resetLocalPreferences"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        <p class="text-sm text-slate-500">
          Saving preferences will immediately re-rank the current results if you already have an active search.
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { EVENT_CATEGORIES } from '@/constants/categories'
import { usePreferencesStore } from '@/stores/preferences'
import { useSearchStore } from '@/stores/search'

export default {
  name: 'PreferencesPage',

  data() {
    return {
      radius: 25,
      hideDuplicateEvents: true,
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

    selectedCategories(): string[] {
      return this.preferencesStore.preferredCategories
    },
  },

  mounted() {
    this.radius = this.preferencesStore.defaultRadiusKm
    this.hideDuplicateEvents = this.preferencesStore.hideDuplicateEvents
  },

  methods: {
    toggleCategory(category: string) {
      const exists = this.preferencesStore.preferredCategories.includes(category)

      if (exists) {
        this.preferencesStore.setPreferredCategories(
          this.preferencesStore.preferredCategories.filter((item) => item !== category),
        )
      } else {
        this.preferencesStore.setPreferredCategories([
          ...this.preferencesStore.preferredCategories,
          category,
        ])
      }
    },

    savePreferences() {
      this.preferencesStore.setDefaultRadiusKm(this.radius)
      this.preferencesStore.setHideDuplicateEvents(this.hideDuplicateEvents)
      this.preferencesStore.markSetupComplete()
      this.searchStore.applyFrontendRanking()
    },

    resetLocalPreferences() {
      this.preferencesStore.resetPreferences()
      this.radius = this.preferencesStore.defaultRadiusKm
      this.hideDuplicateEvents = this.preferencesStore.hideDuplicateEvents
      this.searchStore.applyFrontendRanking()
    },
  },
}
</script>