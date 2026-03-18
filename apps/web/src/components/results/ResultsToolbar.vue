<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:sticky md:top-[73px] md:p-4">
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-900">Results</p>
          <p class="hidden text-xs text-slate-500 sm:block">
            Frontend-ranked by preferences, distance, and time.
          </p>
        </div>

        <div class="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
            :class="
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            "
            @click="$emit('change-view', 'list')"
          >
            List
          </button>

          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
            :class="
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            "
            @click="$emit('change-view', 'map')"
          >
            Map
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label for="sortBy" class="sr-only">Sort by</label>

        <select
          id="sortBy"
          :value="sortBy"
          class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 sm:flex-none"
          @change="emitSortChange"
        >
          <option value="relevance">Relevance</option>
          <option value="distance">Distance</option>
          <option value="date">Date</option>
        </select>

        <span class="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
          {{ resultsCount }}
        </span>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1">
        <span class="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ radiusKm }} km
        </span>

        <span
          v-for="(category,index) in selectedCategories"
          :key="index"
          class="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
        >
          {{ category }}
        </span>

        <span
          v-if="!selectedCategories.length"
          class="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          All categories
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ResultsToolbar',

  props: {
    sortBy: {
      type: String,
      required: true,
    },
    viewMode: {
      type: String,
      required: true,
    },
    selectedCategories: {
      type: Array,
      required: true,
    },
    radiusKm: {
      type: Number,
      required: true,
    },
    resultsCount: {
      type: Number,
      required: true,
    },
  },

  emits: ['change-sort', 'change-view'],

  methods: {
    emitSortChange(event: Event) {
      const target = event.target as HTMLSelectElement
      this.$emit('change-sort', target.value)
    },
  },
}
</script>