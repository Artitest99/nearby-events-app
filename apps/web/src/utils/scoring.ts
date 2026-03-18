// src/utils/scoring.ts
import type { EventItem, EventScoreBreakdown } from '@/types/event'

export interface FrontendScoringInput {
  events: EventItem[]
  selectedCategories: string[]
  preferredCategories: string[]
  dislikedCategories: string[]
  radiusKm: number
  startDate: string
  endDate?: string
  sortBy: 'relevance' | 'distance' | 'date'
  hideDuplicateEvents: boolean
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeCategory(value?: string): string {
  return (value || '').trim().toLowerCase()
}

function normalizeText(value?: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
}

function scoreCategory(
  event: EventItem,
  selectedCategories: string[],
  preferredCategories: string[],
  dislikedCategories: string[],
): number {
  const eventCategory = normalizeCategory(event.category)
  const selected = selectedCategories.map(normalizeCategory)
  const preferred = preferredCategories.map(normalizeCategory)
  const disliked = dislikedCategories.map(normalizeCategory)

  if (disliked.includes(eventCategory)) {
    return 0.05
  }

  if (selected.length > 0) {
    if (selected.includes(eventCategory)) {
      return preferred.includes(eventCategory) ? 1 : 0.92
    }

    return 0.15
  }

  if (preferred.length > 0) {
    if (preferred.includes(eventCategory)) {
      return 0.95
    }

    return 0.45
  }

  return 0.6
}

function scoreDistance(event: EventItem, radiusKm: number): number {
  if (typeof event.distanceKm !== 'number') {
    return 0.45
  }

  if (radiusKm <= 0) {
    return 0.5
  }

  const ratio = clamp(1 - event.distanceKm / radiusKm, 0, 1)
  return Math.pow(ratio, 0.65)
}

function scoreTime(event: EventItem, startDate: string, endDate?: string): number {
  if (!event.startDateTime) {
    return 0.3
  }

  const eventDate = new Date(event.startDateTime)
  const searchStart = new Date(`${startDate}T00:00:00`)

  if (Number.isNaN(eventDate.getTime()) || Number.isNaN(searchStart.getTime())) {
    return 0.3
  }

  if (endDate) {
    const searchEnd = new Date(`${endDate}T23:59:59`)
    const totalRangeDays = Math.max(daysBetween(searchStart, searchEnd), 1)
    const offsetDays = daysBetween(searchStart, eventDate)

    if (eventDate < searchStart || eventDate > searchEnd) {
      return 0.1
    }

    return clamp(1 - offsetDays / totalRangeDays)
  }

  const offsetDays = daysBetween(searchStart, eventDate)
  return clamp(1 - offsetDays / 30)
}

function scoreQuality(event: EventItem): number {
  let score = 0.2

  if (event.imageUrl) score += 0.25
  if (event.venueName) score += 0.15
  if (event.city) score += 0.1
  if (event.description) score += 0.15
  if (event.externalUrl) score += 0.1
  if (event.startDateTime) score += 0.05

  return clamp(score)
}

function buildRelevanceScore(parts: Omit<EventScoreBreakdown, 'relevance'>): number {
  const score =
    0.45 * parts.category +
    0.3 * parts.distance +
    0.2 * parts.time +
    0.05 * parts.quality

  return clamp(Number(score.toFixed(4)))
}

function buildScoreBreakdown(
  event: EventItem,
  input: FrontendScoringInput,
): EventScoreBreakdown {
  const category = scoreCategory(
    event,
    input.selectedCategories,
    input.preferredCategories,
    input.dislikedCategories,
  )

  const distance = scoreDistance(event, input.radiusKm)
  const time = scoreTime(event, input.startDate, input.endDate)
  const quality = scoreQuality(event)
  const relevance = buildRelevanceScore({
    category,
    distance,
    time,
    quality,
  })

  return {
    category: Number(category.toFixed(4)),
    distance: Number(distance.toFixed(4)),
    time: Number(time.toFixed(4)),
    quality: Number(quality.toFixed(4)),
    relevance,
  }
}

function compareByDate(a: EventItem, b: EventItem): number {
  const aTime = new Date(a.startDateTime).getTime()
  const bTime = new Date(b.startDateTime).getTime()

  if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
  if (Number.isNaN(aTime)) return 1
  if (Number.isNaN(bTime)) return -1

  return aTime - bTime
}

function compareByDistance(a: EventItem, b: EventItem): number {
  const aDistance = typeof a.distanceKm === 'number' ? a.distanceKm : Number.POSITIVE_INFINITY
  const bDistance = typeof b.distanceKm === 'number' ? b.distanceKm : Number.POSITIVE_INFINITY
  return aDistance - bDistance
}

function buildDuplicateKey(event: EventItem): string {
  const title = normalizeText(event.title)
  const venue = normalizeText(event.venueName)
  const city = normalizeText(event.city)

  return `${title}__${venue || city || 'unknown'}`
}

function buildGroupedResults(sortedEvents: EventItem[]): EventItem[] {
  const groups = new Map<string, EventItem[]>()
  const order: string[] = []

  sortedEvents.forEach((event) => {
    const key = buildDuplicateKey(event)

    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }

    groups.get(key)?.push(event)
  })

  return order.map((key) => {
    const items = groups.get(key) || []
    const primary = items[0]
    const groupedOccurrences = [...items].sort(compareByDate)

    return {
      ...primary,
      isGrouped: groupedOccurrences.length > 1,
      duplicateCount: Math.max(groupedOccurrences.length - 1, 0),
      groupedOccurrences,
    }
  }) 
}

export function buildRankedEvents(input: FrontendScoringInput): EventItem[] {
  const ranked = input.events.map((event) => {
    const scoreBreakdown = buildScoreBreakdown(event, input)

    return {
      ...event,
      score: scoreBreakdown.relevance,
      scoreBreakdown,
    }
  })

  let sorted: EventItem[]

  if (input.sortBy === 'distance') {
    sorted = ranked.sort((a, b) => {
      const distanceOrder = compareByDistance(a, b)
      if (distanceOrder !== 0) return distanceOrder
      return (b.score || 0) - (a.score || 0)
    })
  } else if (input.sortBy === 'date') {
    sorted = ranked.sort((a, b) => {
      const dateOrder = compareByDate(a, b)
      if (dateOrder !== 0) return dateOrder
      return (b.score || 0) - (a.score || 0)
    })
  } else {
    sorted = ranked.sort((a, b) => {
      const relevanceOrder = (b.score || 0) - (a.score || 0)
      if (relevanceOrder !== 0) return relevanceOrder

      const distanceOrder = compareByDistance(a, b)
      if (distanceOrder !== 0) return distanceOrder

      return compareByDate(a, b)
    })
  }

  if (input.hideDuplicateEvents) {
    return buildGroupedResults(sorted)
  }

  return sorted.map((event) => ({
    ...event,
    isGrouped: false,
    duplicateCount: 0,
    groupedOccurrences: [event],
  }))
}