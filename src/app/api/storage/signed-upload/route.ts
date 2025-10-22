import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const kind: 'image' | 'video' = body?.kind === 'video' ? 'video' : 'image'
    const extRaw: string | undefined = typeof body?.ext === 'string' ? body.ext : undefined
    const contentType: string | undefined = typeof body?.contentType === 'string' ? body.contentType : undefined

    const id = crypto.randomUUID()
    const ext = (extRaw || (kind === 'video' ? 'mp4' : 'jpg')).replace(/[^a-zA-Z0-9]/g, '') || (kind === 'video' ? 'mp4' : 'jpg')
    const path = `${kind}s/${id}.${ext}`

    const admin = getSupabaseAdmin()
    const { data, error } = await admin.storage.from('media').createSignedUploadUrl(path, {
      upsert: true,
      contentType,
    } as any)
    if (error || !data) {
      return NextResponse.json({ message: 'Failed to create signed upload URL', error: error?.message }, { status: 500 })
    }

    return NextResponse.json({ path, token: data.token })
  } catch (e: any) {
    console.error('Signed upload error:', e)
    return NextResponse.json({ message: 'Internal error', error: e?.message || 'Unknown' }, { status: 500 })
  }
}

