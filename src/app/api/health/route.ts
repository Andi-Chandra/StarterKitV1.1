import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db, getEffectiveDatabaseUrl } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const startedAt = Date.now()
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)

  try {
    // Ensure Prisma can connect and basic query works
    await db.$connect()
    // Use a lightweight query that works for SQLite
    await db.$queryRaw`SELECT 1`

    const payload: any = {
      ok: true,
      runtime: process.env.NODE_ENV || 'development',
      prisma: { version: Prisma.prismaVersion.client },
      db: { status: 'ok' as const },
      env: { hasDatabaseUrl },
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    }
    if (process.env.DEBUG_HEALTH_DB_PATH === 'true') {
      payload.db.path = getEffectiveDatabaseUrl()
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    const e = error as any
    const payload: any = {
      ok: false,
      runtime: process.env.NODE_ENV || 'development',
      prisma: { version: Prisma.prismaVersion.client },
      db: { status: 'error' as const, message: e?.message ?? 'Unknown error' },
      env: { hasDatabaseUrl },
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    }
    if (process.env.DEBUG_HEALTH_DB_PATH === 'true') {
      payload.db.path = getEffectiveDatabaseUrl()
    }

    // Service Unavailable so external checks can detect failure
    return NextResponse.json(payload, { status: 503 })
  }
}
