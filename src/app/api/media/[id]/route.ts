import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaId = params.id

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
