import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { requireSupabaseUser } from '@/lib/auth-server'
import { z } from 'zod'

function normalizeMediaUrl(url: string | null | undefined, fileType?: string | null) {
  if (!url) return url
  const type = fileType?.toUpperCase?.() ?? ''
  if (type !== 'VIDEO') return url
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('width')
    parsed.searchParams.delete('height')
    parsed.searchParams.delete('resize')
    if (parsed.pathname.includes('/render/image/')) {
      const [, rest] = parsed.pathname.split('/render/image/')
      parsed.pathname = `/storage/v1/object/${rest}`
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const updateMediaSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.enum(['IMAGE', 'VIDEO']).optional(),
  categoryId: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const mediaId = (await params).id
    const mediaItem = await db.mediaItem.findUnique({
      where: { id: mediaId },
      include: { category: true, creator: true },
    })

    if (!mediaItem) {
      return NextResponse.json({ message: 'Media item not found' }, { status: 404 })
    }

    return NextResponse.json({
      mediaItem: {
        ...mediaItem,
        fileType: mediaItem.fileType?.toUpperCase?.() ?? mediaItem.fileType,
        fileUrl: normalizeMediaUrl(mediaItem.fileUrl, mediaItem.fileType),
      }
    })
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSupabaseUser(request)
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const mediaId = (await params).id

    // Check if media item exists
    const mediaItem = await db.mediaItem.findUnique({
      where: { id: mediaId }
    })

    if (!mediaItem) {
      return NextResponse.json(
        { message: 'Media item not found' },
        { status: 404 }
      )
    }

    // Delete media item
    await db.mediaItem.delete({
      where: { id: mediaId }
    })

    return NextResponse.json({
      message: 'Media item deleted successfully'
    })

  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSupabaseUser(request)
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const mediaId = (await params).id
    const body = await request.json()
    const data = updateMediaSchema.parse({
      ...body,
      categoryId: body.categoryId === '' ? null : body.categoryId,
      description: body.description ?? null,
    })

    const exists = await db.mediaItem.findUnique({ where: { id: mediaId } })
    if (!exists) {
      return NextResponse.json({ message: 'Media item not found' }, { status: 404 })
    }

    const effectiveType = data.fileType ?? exists.fileType
    const payload = {
      ...data,
      fileType: effectiveType ? effectiveType.toUpperCase() : undefined,
      fileUrl: normalizeMediaUrl(data.fileUrl, effectiveType),
    }

    const updated = await db.mediaItem.update({
      where: { id: mediaId },
      data: payload,
      include: { category: true },
    })

    return NextResponse.json({
      message: 'Media updated',
      mediaItem: {
        ...updated,
        fileType: updated.fileType?.toUpperCase?.() ?? updated.fileType,
        fileUrl: normalizeMediaUrl(updated.fileUrl, updated.fileType),
      }
    })
  } catch (error) {
    console.error('Update media error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
