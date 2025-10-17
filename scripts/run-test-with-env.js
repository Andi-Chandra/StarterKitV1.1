const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.error('.env not found at', envPath)
  process.exit(1)
}

const env = fs.readFileSync(envPath, 'utf8')
const line = env.split(/\r?\n/).find(l => l.trim().startsWith('DATABASE_URL'))
if (!line) {
  console.error('DATABASE_URL not found in .env')
  process.exit(1)
}

let val = line.replace(/^DATABASE_URL\s*=\s*"?/, '').replace(/"?$/, '').trim()
process.env.DATABASE_URL = val
console.log('DATABASE_URL set to:', process.env.DATABASE_URL)

// Require the test script; it will pick up process.env.DATABASE_URL
require(path.resolve(process.cwd(), 'test-db-connection.js'))
