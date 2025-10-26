import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { Prisma } from '@prisma/client'
import { requireSupabaseUser } from '@/lib/auth-server'

const updatesSchema = z.object({
  updates: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.any(),
        description: z.string().optional(),
      })
    )
    .min(1),
})

export async function GET() {
  try {
    const items = await db.siteConfig.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, key: true, value: true, description: true, updatedAt: true, updatedBy: true },
    })

    const parsed = items.map((it) => {
      let parsedValue: any = it.value
      try {
        parsedValue = JSON.parse(it.value)
      } catch {}
      return { ...it, value: parsedValue }
    })

    return NextResponse.json({ items: parsed })
  } catch (error) {
    const e = error as any
    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ code: 'DB_INIT_FAILED', message: 'Database not available' }, { status: 503 })
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSupabaseUser(request)
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.user.id
    let updaterId: string | null = null
    const existingUser = await db.user.findUnique({ where: { id: userId } })
    if (existingUser) {
      updaterId = existingUser.id
    }
    const body = await request.json()
    const { updates } = updatesSchema.parse(body)

    const results: any[] = []
    for (const u of updates) {
      const valueString = (() => {
        try {
          return JSON.stringify(u.value)
        } catch {
          return String(u.value)
        }
      })()

      const existing = await db.siteConfig.findUnique({ where: { key: u.key } })
      if (existing) {
        const updated = await db.siteConfig.update({
          where: { key: u.key },
          data: {
            value: valueString,
            description: u.description ?? existing.description,
            updatedBy: updaterId ?? existing.updatedBy,
          },
          select: { id: true, key: true, value: true, description: true, updatedAt: true, updatedBy: true },
        })
        results.push(updated)
      } else {
        const created = await db.siteConfig.create({
          data: {
            id: randomUUID(),
            key: u.key,
            value: valueString,
            description: u.description ?? null,
            updatedBy: updaterId,
          },
          select: { id: true, key: true, value: true, description: true, updatedAt: true, updatedBy: true },
        })
        results.push(created)
      }
    }

    return NextResponse.json({ message: 'Configuration updated', items: results })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.issues }, { status: 400 })
    }
    const e = error as any
    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ code: 'DB_INIT_FAILED', message: 'Database not available' }, { status: 503 })
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ code: e.code, message: 'Database request error', detail: e.message }, { status: 500 })
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 })
  }
}
