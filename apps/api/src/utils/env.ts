// apps/api/src/utils/env.ts
import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 3000),
  geocodingBaseUrl:
    process.env.GEOCODING_BASE_URL || 'https://nominatim.openstreetmap.org',
  appPublicName: process.env.APP_PUBLIC_NAME || 'NearbyEventsApp/0.1',
  appPublicUrl: process.env.APP_PUBLIC_URL || 'http://localhost:5173',

  ticketmasterApiKey: process.env.TICKETMASTER_API_KEY || '',
  ticketmasterBaseUrl:
    process.env.TICKETMASTER_BASE_URL ||
    'https://app.ticketmaster.com/discovery/v2/',
}