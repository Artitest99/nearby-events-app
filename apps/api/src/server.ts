import app from './app.js'
import { env } from './utils/env.js'

app.listen(env.port, '0.0.0.0', () => {
  console.log(`API running on http://0.0.0.0:${env.port}`)
})