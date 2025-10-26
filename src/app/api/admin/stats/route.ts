import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { requireSupabaseUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSupabaseUser(req)
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const [mediaCount, categoryCount, sliderCount, userCount] = await Promise.all([
      db.mediaItem.count(),
      db.mediaCategory.count(),
      db.slider.count(),
      db.user.count(),
    ])

    return NextResponse.json({
      mediaCount,
      categoryCount,
      sliderCount,
      userCount,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    })
  } catch (error) {
    console.error('Fetch admin stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    )
  }
}
