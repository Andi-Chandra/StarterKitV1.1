import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveSqliteUrlForServerless(defaultUrl?: string) {
  if (!defaultUrl) return defaultUrl
  // Only adjust in Vercel serverless and for SQLite URLs
  if (!process.env.VERCEL) return defaultUrl
  if (!defaultUrl.startsWith('file:')) return defaultUrl

  try {
    const relative = defaultUrl.replace(/^file:/, '')
    // Absolute path of bundled DB within the function package
    const sourcePath = path.resolve(process.cwd(), relative)

    // Copy to /tmp (the only writable dir in AWS Lambda/Vercel)
    const sanitizedRelative = relative.replace(/^\.?\/?/, '') // drop leading ./
    const destPath = path.join('/tmp', sanitizedRelative)
    const destDir = path.dirname(destPath)

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // If dest DB is missing or older than source, copy it
    let shouldCopy = true
    if (fs.existsSync(destPath) && fs.existsSync(sourcePath)) {
      const srcStat = fs.statSync(sourcePath)
      const dstStat = fs.statSync(destPath)
      if (dstStat.mtimeMs >= srcStat.mtimeMs) {
        shouldCopy = false
      }
    }

    if (shouldCopy && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath)
    }

    return `file:${destPath.replace(/\\/g, '/')}`
  } catch (err) {
    console.warn('SQLite /tmp fallback failed:', err)
    return defaultUrl
  }
}

function extractDatabaseUrlFromFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const content = fs.readFileSync(filePath, 'utf8')
    // Find the last DATABASE_URL definition to respect overrides at the bottom
    const lines = content.split(/\r?\n/)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]
      if (!line) continue
      const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/)
      if (match) {
        let val = match[1].trim()
        // Strip surrounding quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        return val
      }
    }
    return null
  } catch {
    return null
  }
}

function preferPostgresDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL
  const isPostgres = (u?: string | null) => !!u && /^(postgres(ql)?):\/\//i.test(u)
  if (isPostgres(envUrl)) return envUrl

  // Fallback: try reading from .env then .env.local (useful when a global env overrides local)
  const cwd = process.cwd()
  const candidates = [path.join(cwd, '.env'), path.join(cwd, '.env.local')]
  for (const p of candidates) {
    const fromFile = extractDatabaseUrlFromFile(p)
    if (isPostgres(fromFile)) return fromFile as string
  }
  // As a last resort, return whatever was set (could be SQLite or undefined)
  return envUrl
}

const baseUrl = preferPostgresDatabaseUrl()
const effectiveUrl = resolveSqliteUrlForServerless(baseUrl)

export function getEffectiveDatabaseUrl() {
  return effectiveUrl || baseUrl || null
}

export const db =
  (globalForPrisma.prisma as PrismaClient | undefined) ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
    datasources: (effectiveUrl || baseUrl)
      ? { db: { url: (effectiveUrl || baseUrl)! } }
      : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
