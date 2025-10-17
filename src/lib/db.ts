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

const effectiveUrl = resolveSqliteUrlForServerless(process.env.DATABASE_URL)

export const db =
  (globalForPrisma.prisma as PrismaClient | undefined) ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
    datasources: effectiveUrl ? { db: { url: effectiveUrl } } : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
