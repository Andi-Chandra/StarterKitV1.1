import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const category = await db.mediaCategory.findUnique({ where: { id } })
    if (!category) {
      return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 })
    }
    return new Response(JSON.stringify({ category }))
  } catch (error) {
    console.error('Get category error:', error)
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const id = params.id
    const body = await request.json()
    const data = updateCategorySchema.parse({
      ...body,
      description: body.description ?? null,
    })

    const exists = await db.mediaCategory.findUnique({ where: { id } })
    if (!exists) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    if (data.slug) {
      const conflict = await db.mediaCategory.findUnique({ where: { slug: data.slug } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ message: 'Slug already in use' }, { status: 409 })
      }
    }

    const updated = await db.mediaCategory.update({ where: { id }, data })
    return NextResponse.json({ message: 'Category updated', category: updated })
  } catch (error) {
    console.error('Update category error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
