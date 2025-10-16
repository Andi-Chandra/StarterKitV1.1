import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const createMediaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL'),
  fileType: z.enum(['IMAGE', 'VIDEO']),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().default(false)
})

// GET method to fetch media items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const type = searchParams.get('type') as 'IMAGE' | 'VIDEO' | null

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (featured === 'true') where.isFeatured = true
    if (type) where.fileType = type

    // Get total count
    const total = await db.mediaItem.count({ where })

    // Get media items
    const mediaItems = await db.mediaItem.findMany({
      where,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    return NextResponse.json({
      mediaItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, fileUrl, fileType, categoryId, isFeatured } = createMediaSchema.parse(body)

    // Create media item
    const mediaItem = await db.mediaItem.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        categoryId: categoryId || null,
        isFeatured,
        createdBy: 'demo-user' // In a real app, get from authenticated user
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Media item created successfully',
      mediaItem
    })

  } catch (error) {
    console.error('Create media error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}