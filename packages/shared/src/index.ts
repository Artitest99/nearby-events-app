export const EVENT_CATEGORIES = [
  'music',
  'theater',
  'comedy',
  'sports',
  'festivals',
  'exhibitions',
  'family',
  'outdoor',
  'tours',
  'expeditions',
  'nightlife',
  'talks',
  'film',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]