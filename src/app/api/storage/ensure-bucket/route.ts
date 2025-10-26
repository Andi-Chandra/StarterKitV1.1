import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { requireSupabaseUser } from '@/lib/auth-server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSupabaseUser(req)
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const bucketId = 'media'

    const { data: bucket, error: getErr } = await admin.storage.getBucket(bucketId)

    if (!bucket) {
      // Create the bucket as public for direct file access via public URLs
      const { error: createErr } = await admin.storage.createBucket(bucketId, { public: true })
      if (createErr && !/already exists/i.test(createErr.message || '')) {
        return NextResponse.json({ message: 'Bucket creation failed', error: createErr.message }, { status: 500 })
      }
    } else if (bucket.public !== true) {
      // Ensure bucket is public
      const { error: updateErr } = await admin.storage.updateBucket(bucketId, { public: true })
      if (updateErr) {
        return NextResponse.json({ message: 'Bucket update failed', error: updateErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Ensure bucket error:', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
