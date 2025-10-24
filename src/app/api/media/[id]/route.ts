import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

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

    return NextResponse.json({ mediaItem })
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
    const session = await getServerSession(authOptions)
    if (!session) {
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
    const session = await getServerSession(authOptions)
    if (!session) {
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

    const updated = await db.mediaItem.update({
      where: { id: mediaId },
      data,
      include: { category: true },
    })

    return NextResponse.json({ message: 'Media updated', mediaItem: updated })
  } catch (error) {
    console.error('Update media error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
