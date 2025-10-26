import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { requireSupabaseUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = await requireSupabaseUser(req)
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { user } = auth
    const metadata = (user.user_metadata || {}) as Record<string, unknown>
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    const fallbackEmail = user.email ?? (typeof metadata.email === 'string' ? metadata.email : null)
    const fallbackName =
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : fallbackEmail
            ? fallbackEmail.split('@')[0]
            : 'User'

    const role =
      (profile?.role ?? (typeof metadata.role === 'string' ? metadata.role : null) ?? 'user').toString()

    return NextResponse.json({
      user: {
        id: profile?.id ?? user.id,
        email: profile?.email ?? fallbackEmail,
        name: profile?.name ?? fallbackName,
        role,
        username:
          typeof metadata.username === 'string'
            ? metadata.username
            : (profile?.email ?? fallbackEmail ?? 'user').split('@')[0],
      },
    })
  } catch (error) {
    console.error('Profile lookup failed:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
