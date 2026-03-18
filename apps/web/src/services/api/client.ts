// src/services/api/client.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const errorData = await response.json()
      if (errorData?.error) {
        message = errorData.error
      }
    } catch {
      // ignore JSON parse failure
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}