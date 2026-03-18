// apps/api/src/services/events.service.ts
import {
  searchTicketmasterEvents,
  type SearchEventsInput,
} from '../providers/ticketmaster/ticketmaster.service.js'

export async function searchEvents(input: SearchEventsInput) {
  return searchTicketmasterEvents(input)
}