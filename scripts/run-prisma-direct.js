const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const envPath = path.resolve(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.error('.env not found at', envPath)
  process.exit(1)
}

const env = fs.readFileSync(envPath, 'utf8')
const line = env.split(/\r?\n/).find(l => l.trim().startsWith('DIRECT_URL'))
if (!line) {
  console.error('DIRECT_URL not found in .env')
  process.exit(1)
}

let val = line.replace(/^DIRECT_URL\s*=\s*"?/, '').replace(/"?$/, '').trim()
process.env.DATABASE_URL = val
console.log('DATABASE_URL (for Prisma) set to:', process.env.DATABASE_URL)

try {
  // Use execSync with shell to avoid spawn quoting/platform issues on Windows
  execSync('npx prisma db push', { stdio: 'inherit', env: process.env, shell: true })
} catch (err) {
  console.error('Prisma db push failed:', err.message)
  process.exit(err.status || 1)
}
