import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

function shouldProdFallback() {
  const v = process.env.ENABLE_MEDIA_API_FALLBACK || process.env.MEDIA_API_FALLBACK
  return v === 'true' || v === '1'
}

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().min(1).optional(),
  featured: z.enum(['true', 'false']).optional(),
  type: z.enum(['IMAGE', 'VIDEO']).optional(),
})

function mockData() {
  const categories = [
    { id: 'mock-nature', name: 'Nature', slug: 'nature', description: 'Mock nature category', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'mock-architecture', name: 'Architecture', slug: 'architecture', description: 'Mock architecture category', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]

  const mediaItems = [
    {
      id: 'mock-media-1',
      title: 'Mountain Landscape',
      description: 'Beautiful mountain scenery with sunset',
      fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      fileType: 'IMAGE',
      fileSize: null,
      dimensions: null,
      isFeatured: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId: categories[0].id,
      createdBy: null,
      category: { id: categories[0].id, name: categories[0].name, slug: categories[0].slug, description: categories[0].description, createdAt: categories[0].createdAt, updatedAt: categories[0].updatedAt },
      creator: null,
    },
    {
      id: 'mock-media-2',
      title: 'City Architecture',
      description: 'Modern building design',
      fileUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop',
      fileType: 'IMAGE',
      fileSize: null,
      dimensions: null,
      isFeatured: false,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId: categories[1].id,
      createdBy: null,
      category: { id: categories[1].id, name: categories[1].name, slug: categories[1].slug, description: categories[1].description, createdAt: categories[1].createdAt, updatedAt: categories[1].updatedAt },
      creator: null,
    },
    {
      id: 'mock-media-3',
      title: 'Product Demo Video',
      description: 'See our product in action',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      fileType: 'VIDEO',
      fileSize: null,
      dimensions: null,
      isFeatured: true,
      sortOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId: null,
      createdBy: null,
      category: null,
      creator: null,
    },
  ]

  return { categories, mediaItems }
}

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
    const parsed = querySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      featured: searchParams.get('featured') ?? undefined,
      type: searchParams.get('type') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, categoryId, featured, type } = parsed.data

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

    // Also return categories for convenience (used by some hooks)
    const categories = await db.mediaCategory.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      mediaItems,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    // Log server-side and return clearer feedback
    console.error('Fetch media error:', error)

    // Development fallback always on
    if (isDev()) {
      const { mediaItems, categories } = mockData()
      return NextResponse.json({
        mediaItems,
        categories,
        pagination: {
          page: 1,
          limit: mediaItems.length,
          total: mediaItems.length,
          pages: 1,
        },
        mock: true,
        hint: 'DB query failed. Ensure DATABASE_URL is set, then run: npm run db:push && npm run db:seed',
        error: (error as Error)?.message ?? 'Unknown error'
      })
    }

    // Optional production fallback (opt-in via env)
    if (shouldProdFallback()) {
      const { mediaItems, categories } = mockData()
      return NextResponse.json({
        mediaItems,
        categories,
        pagination: {
          page: 1,
          limit: mediaItems.length,
          total: mediaItems.length,
          pages: 1,
        },
        mock: true,
        hint: 'Production fallback enabled. Investigate DB connectivity and disable fallback once fixed.',
      })
    }

    // Map Prisma errors to clearer statuses/messages
    const e = error as any
    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { code: 'DB_INIT_FAILED', message: 'Database not available' },
        { status: 503 }
      )
    }
    if (e instanceof Prisma.PrismaClientRustPanicError) {
      return NextResponse.json(
        { code: 'DB_PANIC', message: 'Database engine crashed' },
        { status: 500 }
      )
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Common Prisma error code mapping (subset)
      if (e.code === 'P2023') {
        return NextResponse.json(
          { code: 'MALFORMED_ID', message: 'Malformed id or where condition' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { code: e.code, message: 'Database request error', detail: e.message },
        { status: 500 }
      )
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid query to database' },
        { status: 400 }
      )
    }

    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { title, description, fileUrl, fileType, categoryId, isFeatured } = createMediaSchema.parse(body)

    // Create media item
    const mediaItem = await db.mediaItem.create({
      data: {
        id: randomUUID(),
        title,
        description,
        fileUrl,
        fileType,
        categoryId: categoryId || null,
        isFeatured,
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

    // Map common Prisma errors to clearer responses
    const e = error as any
    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { code: 'DB_INIT_FAILED', message: 'Database not available' },
        { status: 503 }
      )
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003: Foreign key constraint failed
      if (e.code === 'P2003') {
        return NextResponse.json(
          { code: 'FK_CONSTRAINT', message: 'Related record not found (check categoryId/createdBy)' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { code: e.code, message: 'Database request error', detail: e.message },
        { status: 500 }
      )
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid data or missing required fields' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
