<template>
    <section :class="uiStore.resultsViewMode === 'swipe'
            ? 'space-y-1 h-[calc(100svh-var(--app-header-offset)-4px)] overflow-hidden pb-1'
            : 'space-y-6'
        ">
        <div v-if="uiStore.resultsViewMode !== 'swipe'">
            <p class="text-sm font-medium uppercase tracking-wide text-sky-600">Results</p>
            <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Event results</h1>
            <p class="mt-3 text-slate-600">
                Nearby upcoming events ranked for your selected place, dates, and preferences.
            </p>
        </div>

        <div v-if="!hasSearchContext" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-lg font-semibold text-slate-900">No active search yet</p>
            <p class="mt-2 text-slate-600">
                Go back to the search page and choose a place and dates first.
            </p>

            <RouterLink to="/"
                class="mt-4 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700">
                Back to search
            </RouterLink>
        </div>

        <template v-else>
            <div class="grid gap-6 xl:grid-cols-[320px_1fr]">
                <div v-if="uiStore.resultsViewMode !== 'swipe'" class="space-y-4">
                    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <button type="button" class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                            @click="showSearchSummary = !showSearchSummary">
                            <div>
                                <p class="text-base font-semibold text-slate-900">Search summary</p>
                                <p class="mt-1 text-xs text-slate-500">Place, dates, categories</p>
                            </div>

                            <ChevronDown class="h-4 w-4 text-slate-500 transition"
                                :class="showSearchSummary ? 'rotate-180' : ''" />
                        </button>

                        <transition name="expand-fade">
                            <div v-if="showSearchSummary" class="border-t border-slate-100 px-5 py-4">
                                <div class="space-y-3 text-sm text-slate-600">
                                    <p>
                                        <span class="font-medium text-slate-800">Place:</span>
                                        {{ placeText }}
                                    </p>

                                    <p>
                                        <span class="font-medium text-slate-800">Date range:</span>
                                        {{ dateText }}
                                    </p>

                                    <p>
                                        <span class="font-medium text-slate-800">Radius:</span>
                                        {{ searchStore.radiusKm }} km
                                    </p>

                                    <p>
                                        <span class="font-medium text-slate-800">Backend categories:</span>
                                        {{ categoriesText }}
                                    </p>

                                    <p v-if="searchStore.lastMeta">
                                        <span class="font-medium text-slate-800">Provider:</span>
                                        {{ searchStore.lastMeta.provider }}
                                    </p>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <button type="button" class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                            @click="showDataStatus = !showDataStatus">
                            <div>
                                <p class="text-base font-semibold text-slate-900">Data status</p>
                                <p class="mt-1 text-xs text-slate-500">Counts and refresh</p>
                            </div>

                            <ChevronDown class="h-4 w-4 text-slate-500 transition"
                                :class="showDataStatus ? 'rotate-180' : ''" />
                        </button>

                        <transition name="expand-fade">
                            <div v-if="showDataStatus" class="border-t border-slate-100 px-5 py-4">
                                <div class="flex items-center justify-between gap-4">
                                    <p class="text-sm font-medium text-slate-700">Current status</p>

                                    <button type="button"
                                        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        @click="runSearch">
                                        Refresh
                                    </button>
                                </div>

                                <div class="mt-4 space-y-2 text-sm text-slate-600">
                                    <p>Provider matches fetched: {{ searchStore.rawResults.length }}</p>
                                    <p>Visible cards after grouping/filtering: {{ searchStore.visibleResults.length }}
                                    </p>
                                    <p>Current sort: {{ searchStore.sortBy }}</p>
                                    <p>Current view: {{ uiStore.resultsViewMode }}</p>
                                    <p>
                                        Frontend tag filter:
                                        {{ searchStore.activeTagFilter || 'none' }}
                                    </p>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>

                <div class="space-y-3" :class="uiStore.resultsViewMode === 'swipe'
                    ? 'mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden'
                    : ''
                    ">
                    <ResultsToolbar :sort-by="searchStore.sortBy" :view-mode="uiStore.resultsViewMode"
                        :results-count="searchStore.visibleResults.length"
                        :tag-summaries="searchStore.availableTagSummaries"
                        :active-tag-filter="searchStore.activeTagFilter || undefined" @change-sort="changeSort"
                        @change-view="changeView" @toggle-tag-filter="toggleTagFilter" />

                    <div v-if="searchStore.loading" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p class="text-slate-700">Loading events...</p>
                    </div>

                    <div v-else-if="searchStore.error"
                        class="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                        <p class="text-lg font-semibold text-red-800">Could not load events</p>
                        <p class="mt-2 text-red-700">{{ searchStore.error }}</p>

                        <button type="button"
                            class="mt-4 rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
                            @click="runSearch">
                            Try again
                        </button>
                    </div>

                    <div v-else-if="!searchStore.visibleResults.length"
                        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p class="text-lg font-semibold text-slate-900">No events found</p>
                        <p class="mt-2 text-slate-600">
                            Try a different frontend tag, broader categories, or a different date range.
                        </p>
                    </div>

                    <ResultsMap v-else-if="uiStore.resultsViewMode === 'map'" :events="searchStore.visibleResults"
                        :selected-place="searchStore.selectedPlace" />

                    <SwipeEventDeck v-else-if="uiStore.resultsViewMode === 'swipe'"
                        :events="searchStore.visibleResults" />

                    <div v-else class="grid gap-5">
                        <EventCard v-for="event in searchStore.visibleResults" :key="event.id" :event="event" />
                    </div>
                </div>
            </div>
        </template>
    </section>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import EventCard from '@/components/event/EventCard.vue'
import ResultsMap from '@/components/map/ResultsMap.vue'
import ResultsToolbar from '@/components/results/ResultsToolbar.vue'
import { useSearchStore } from '@/stores/search'
import { useUiStore } from '@/stores/ui'
import SwipeEventDeck from '@/components/results/SwipeEventDeck.vue'
export default {
    name: 'ResultsPage',

    components: {
        RouterLink,
        ChevronDown,
        EventCard,
        ResultsMap,
        ResultsToolbar,
        SwipeEventDeck
    },

    data() {
        return {
            showSearchSummary: false,
            showDataStatus: false,
        }
    },

    computed: {
        searchStore() {
            return useSearchStore()
        },

        uiStore() {
            return useUiStore()
        },

        hasSearchContext(): boolean {
            return !!this.searchStore.selectedPlace && !!this.searchStore.startDate
        },

        placeText(): string {
            return this.searchStore.selectedPlace
                ? this.searchStore.selectedPlace.displayName
                : 'None selected'
        },

        dateText(): string {
            if (this.searchStore.endDate) {
                return `${this.searchStore.startDate} → ${this.searchStore.endDate}`
            }

            return `${this.searchStore.startDate} onward`
        },

        categoriesText(): string {
            return this.searchStore.selectedCategories.length
                ? this.searchStore.selectedCategories.join(', ')
                : 'all categories'
        },
    },

    mounted() {
        if (window.innerWidth < 768 && this.uiStore.resultsViewMode === 'list') {
            this.uiStore.setResultsViewMode('swipe')
        }

        if (this.hasSearchContext && !this.searchStore.results.length && !this.searchStore.loading) {
            this.runSearch()
        }
    },

    methods: {
        async runSearch() {
            console.log('[ResultsPage] runSearch() triggered')
            await this.searchStore.searchEvents()
        },

        changeSort(value: 'relevance' | 'distance' | 'date') {
            this.searchStore.setSortBy(value)
        },

        changeView(value: 'list' | 'map') {
            this.uiStore.setResultsViewMode(value)
        },

        toggleTagFilter(value: string | null) {
            if (!value) {
                this.searchStore.clearActiveTagFilter()
                return
            }

            this.searchStore.toggleActiveTagFilter(value)
        },
    },
}
</script>