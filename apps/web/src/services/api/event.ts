// src/services/api/events.ts
import type { EventSearchRequest, EventSearchResponse } from '@/types/event'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function searchEvents(
  payload: EventSearchRequest,
): Promise<EventSearchResponse> {
  console.log('[frontend events.ts] Sending /events/search payload:')
  console.log(payload)

  const response = await fetch(`${API_BASE_URL}/events/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  console.log('[frontend events.ts] Response status:', response.status)

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const errorData = await response.json()
      console.log('[frontend events.ts] Error response body:', errorData)

      if (errorData?.error) {
        message = errorData.error
      }
    } catch {
      // ignore JSON parse failure
    }

    throw new Error(message)
  }

  const data = (await response.json()) as EventSearchResponse

  console.log('[frontend events.ts] Response body:')
  console.log(data)

  return data
}