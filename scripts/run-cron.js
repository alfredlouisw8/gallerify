// Run with: node scripts/run-cron.js
// Requires the dev server to be running (npm run dev)

const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

const CRON_SECRET = process.env.CRON_SECRET
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const url = `${BASE_URL}/api/cron/subscription-cleanup`

if (!CRON_SECRET) {
  console.error('CRON_SECRET is not set in .env.local')
  process.exit(1)
}

console.log(`POST ${url}`)

fetch(url, {
  headers: { Authorization: `Bearer ${CRON_SECRET}` },
})
  .then((res) => res.json().then((body) => ({ status: res.status, body })))
  .then(({ status, body }) => {
    console.log(`Status: ${status}`)
    console.log(JSON.stringify(body, null, 2))
  })
  .catch((err) => {
    console.error('Request failed:', err.message)
    process.exit(1)
  })
