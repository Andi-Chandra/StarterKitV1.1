import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id

    // Check if category exists
    const category = await db.mediaCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has media items
    const mediaCount = await db.mediaItem.count({
      where: { categoryId: categoryId }
    })

    if (mediaCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category with associated media items' },
        { status: 400 }
      )
    }

    // Delete category
    await db.mediaCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}