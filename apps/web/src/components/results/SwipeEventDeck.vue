<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <div class="relative flex-1 overflow-hidden">
      <div
        class="h-full select-none"
        style="touch-action: pan-y;"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          v-if="currentEvent"
          class="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(2,6,23,0.35)]"
          :style="cardStyle"
        >
          <div class="relative h-[36svh] shrink-0 bg-slate-100 sm:h-[40svh]">
            <img
              v-if="currentEvent.imageUrl"
              :src="currentEvent.imageUrl"
              :alt="currentEvent.title"
              class="h-full w-full object-cover"
            />

            <div
              v-else
              class="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200"
            />

            <button
              type="button"
              aria-label="Previous event"
              class="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/80 text-slate-800 shadow-lg backdrop-blur transition duration-200 hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentIndex === 0"
              @click="goPrevious"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Next event"
              class="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/80 text-slate-800 shadow-lg backdrop-blur transition duration-200 hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentIndex >= events.length - 1"
              @click="goNext"
            >
              <ChevronRight class="h-5 w-5" />
            </button>

            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

            <div class="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {{ currentIndex + 1 }} / {{ events.length }}
            </div>
          </div>

          <div class="flex min-h-0 flex-1 flex-col justify-between p-4 sm:p-5">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  {{ currentEvent.category }}
                </span>

                <span
                  v-if="currentEvent.distanceKm != null"
                  class="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                >
                  {{ currentEvent.distanceKm }} km
                </span>

                <span
                  v-if="currentEvent.score != null"
                  class="rounded-full bg-sky-50 px-3 py-1 text-sky-700"
                >
                  {{ scorePercent }}%
                </span>
              </div>

              <div>
                <h3 class="text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
                  {{ currentEvent.title }}
                </h3>

                <p class="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                  <Clock3 class="h-4 w-4 text-slate-400" />
                  {{ formattedDate }}
                </p>

                <p
                  v-if="currentEvent.venueName"
                  class="mt-2 flex min-w-0 items-start gap-2 text-sm text-slate-600"
                >
                  <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span class="break-words">
                    {{ currentEvent.venueName }}
                    <span v-if="currentEvent.city"> · {{ currentEvent.city }}</span>
                  </span>
                </p>
              </div>

              <p v-if="shortDescription" class="line-clamp-3-swipe text-sm leading-6 text-slate-600">
                {{ shortDescription }}
              </p>
            </div>

            <div class="mt-4 grid gap-3 sm:flex sm:flex-wrap">
              <RouterLink
                :to="`/event/${encodeURIComponent(currentEvent.providerEventId)}`"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Info class="h-4 w-4" />
                Details
              </RouterLink>

              <a
                v-if="currentEvent.externalUrl"
                :href="currentEvent.externalUrl"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                <ExternalLink class="h-4 w-4" />
                Open event
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-center gap-1.5">
      <span
        v-for="(_, index) in indicatorCount"
        :key="index"
        class="h-2.5 rounded-full transition-all duration-200"
        :class="index === indicatorActiveIndex ? 'w-6 bg-sky-600' : 'w-2.5 bg-slate-300'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Info,
  MapPin,
} from 'lucide-vue-next'
import type { EventItem } from '@/types/event'

export default defineComponent({
  name: 'SwipeEventDeck',

  components: {
    ChevronLeft,
    ChevronRight,
    Clock3,
    ExternalLink,
    Info,
    MapPin,
    RouterLink,
  },

  props: {
    events: {
      type: Array as PropType<EventItem[]>,
      required: true,
    },
  },

  data() {
    return {
      currentIndex: 0,
      touchStartX: 0,
      dragOffsetX: 0,
      isDragging: false,
    }
  },

  computed: {
    currentEvent(): EventItem | null {
      return this.events[this.currentIndex] || null
    },

    formattedDate(): string {
      if (!this.currentEvent?.startDateTime) {
        return 'Date unavailable'
      }

      const date = new Date(this.currentEvent.startDateTime)

      if (Number.isNaN(date.getTime())) {
        return 'Date unavailable'
      }

      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    },

    shortDescription(): string {
      if (!this.currentEvent?.description) return ''

      if (this.currentEvent.description.length <= 180) {
        return this.currentEvent.description
      }

      return `${this.currentEvent.description.slice(0, 177)}...`
    },

    scorePercent(): number {
      return Math.round((this.currentEvent?.score || 0) * 100)
    },

    cardStyle(): Record<string, string> {
      const rotation = this.dragOffsetX / 30
      const opacity = String(1 - Math.min(Math.abs(this.dragOffsetX) / 500, 0.18))

      return {
        transform: `translateX(${this.dragOffsetX}px) rotate(${rotation}deg)`,
        transition: this.isDragging ? 'none' : 'transform 220ms ease, opacity 220ms ease',
        opacity,
      }
    },

    indicatorCount(): number {
      return Math.min(this.events.length, 7)
    },

    indicatorActiveIndex(): number {
      if (this.events.length <= 7) {
        return this.currentIndex
      }

      return Math.min(this.currentIndex, 6)
    },
  },

  watch: {
    events: {
      deep: true,
      handler(newEvents: EventItem[]) {
        if (!newEvents.length) {
          this.currentIndex = 0
          return
        }

        if (this.currentIndex > newEvents.length - 1) {
          this.currentIndex = 0
        }
      },
    },
  },

  methods: {
    goNext() {
      if (this.currentIndex < this.events.length - 1) {
        this.currentIndex += 1
      }
      this.dragOffsetX = 0
      this.isDragging = false
    },

    goPrevious() {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1
      }
      this.dragOffsetX = 0
      this.isDragging = false
    },

    onTouchStart(event: TouchEvent) {
      const touch = event.touches[0]
      if (!touch) return

      this.touchStartX = touch.clientX
      this.isDragging = true
    },

    onTouchMove(event: TouchEvent) {
      if (!this.isDragging) return

      const touch = event.touches[0]
      if (!touch) return

      const currentX = touch.clientX
      this.dragOffsetX = currentX - this.touchStartX
    },

    onTouchEnd() {
      if (!this.isDragging) return

      const threshold = 70

      if (this.dragOffsetX <= -threshold) {
        this.goNext()
      } else if (this.dragOffsetX >= threshold) {
        this.goPrevious()
      } else {
        this.dragOffsetX = 0
        this.isDragging = false
      }
    },
  },
})
</script>