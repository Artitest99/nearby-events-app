<template>
  <div
    class="sticky z-20 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur md:p-3"
    style="top: calc(var(--app-header-offset) + env(safe-area-inset-top, 0px));"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-1.5">
        <div class="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition"
            :class="
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            "
            @click="$emit('change-view', 'list')"
          >
            <List class="h-4 w-4" />
            <span class="hidden xs:inline">List</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition"
            :class="
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            "
            @click="$emit('change-view', 'map')"
          >
            <Map class="h-4 w-4" />
            <span class="hidden xs:inline">Map</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition"
            :class="
              viewMode === 'swipe'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            "
            @click="$emit('change-view', 'swipe')"
          >
            <Smartphone class="h-4 w-4" />
            <span class="hidden xs:inline">Swipe</span>
          </button>
        </div>

        <div class="relative min-w-0 flex-1">
          <ArrowUpDown class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label for="sortBy" class="sr-only">Sort by</label>
          <select
            id="sortBy"
            :value="sortBy"
            class="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-500"
            @change="emitSortChange"
          >
            <option value="relevance">Relevance</option>
            <option value="distance">Distance</option>
            <option value="date">Date</option>
          </select>
        </div>

        <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
          {{ resultsCount }}
        </span>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          class="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
          :class="
            !activeTagFilter
              ? 'bg-sky-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          "
          @click="$emit('toggle-tag-filter', null)"
        >
          All
        </button>

        <button
          v-for="item in tagSummaries"
          :key="item.tag"
          type="button"
          class="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
          :class="
            activeTagFilter === item.tag
              ? 'bg-sky-600 text-white'
              : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
          "
          @click="$emit('toggle-tag-filter', item.tag)"
        >
          {{ item.tag }}
          <span class="ml-1 opacity-75">({{ item.count }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { ArrowUpDown, List, Map, Smartphone } from 'lucide-vue-next'

interface TagSummary {
  tag: string
  count: number
}

export default defineComponent({
  name: 'ResultsToolbar',

  components: {
    ArrowUpDown,
    List,
    Map,
    Smartphone,
  },

  props: {
    sortBy: {
      type: String,
      required: true,
    },
    viewMode: {
      type: String,
      required: true,
    },
    resultsCount: {
      type: Number,
      required: true,
    },
    tagSummaries: {
      type: Array as PropType<TagSummary[]>,
      required: true,
    },
    activeTagFilter: {
      type: String,
      default: null,
    },
  },

  emits: ['change-sort', 'change-view', 'toggle-tag-filter'],

  methods: {
    emitSortChange(event: Event) {
      const target = event.target as HTMLSelectElement
      this.$emit('change-sort', target.value)
    },
  },
})
</script>