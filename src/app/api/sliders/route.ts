import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

function shouldProdFallback() {
  const v = process.env.ENABLE_SLIDERS_API_FALLBACK || process.env.SLIDERS_API_FALLBACK
  return v === 'true' || v === '1'
}

function mockSliders() {
  const now = new Date().toISOString()
  return [
    {
      id: 'mock-slider-image',
      name: 'Homepage Image Slider',
      type: 'IMAGE',
      isActive: true,
      autoPlay: true,
      autoPlayInterval: 5000,
      loop: true,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: 'mock-slide-1',
          title: 'Welcome to Our Modern Web App',
          subtitle: 'Experience the Future',
          callToAction: 'Get Started',
          callToActionUrl: '#features',
          sortOrder: 1,
          media: {
            id: 'mock-media-hero',
            title: 'Hero Image',
            description: 'A beautiful hero image for the homepage',
            fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop',
            fileType: 'IMAGE',
            fileSize: null,
            dimensions: null,
            isFeatured: true,
            sortOrder: 1,
            createdAt: now,
            updatedAt: now,
            categoryId: null,
            createdBy: null,
            category: null,
            creator: null,
          },
        },
      ],
    },
    {
      id: 'mock-slider-video',
      name: 'Homepage Video Slider',
      type: 'VIDEO',
      isActive: true,
      autoPlay: false,
      autoPlayInterval: 8000,
      loop: true,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: 'mock-slide-video-1',
          title: 'Product Demo',
          subtitle: 'See it in action',
          callToAction: 'Learn More',
          callToActionUrl: '#',
          sortOrder: 1,
          media: {
            id: 'mock-media-video',
            title: 'Demo Video',
            description: 'Big Buck Bunny sample',
            fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            fileType: 'VIDEO',
            fileSize: null,
            dimensions: null,
            isFeatured: true,
            sortOrder: 1,
            createdAt: now,
            updatedAt: now,
            categoryId: null,
            createdBy: null,
            category: null,
            creator: null,
          },
        },
      ],
    },
  ]
}

const createSliderSchema = z.object({
  name: z.string().min(1, 'Slider name is required'),
  type: z.enum(['IMAGE', 'VIDEO']),
  isActive: z.boolean().default(true),
  autoPlay: z.boolean().default(true),
  autoPlayInterval: z.number().default(5000),
  loop: z.boolean().default(true),
  items: z.array(z.object({
    title: z.string().min(1, 'Item title is required'),
    subtitle: z.string().optional(),
    callToAction: z.string().optional(),
    callToActionUrl: z.string().optional(),
    mediaId: z.string().min(1, 'Media is required'),
    sortOrder: z.number()
  })).optional()
})

// GET method to fetch sliders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const type = searchParams.get('type') as 'IMAGE' | 'VIDEO' | null

    // Build where clause
    const where: any = {}
    if (active === 'true') where.isActive = true
    if (active === 'false') where.isActive = false
    if (type) where.type = type

    // Get sliders
    const sliders = await db.slider.findMany({
      where,
      include: {
        items: {
          include: {
            media: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      { sliders },
      { headers: { 'Cache-Control': 'no-store' } }
    )

  } catch (error) {
    console.error('Fetch sliders error:', error)

    // Development fallback always on
    if (isDev()) {
      return NextResponse.json(
        {
          sliders: mockSliders(),
          mock: true,
          hint: 'DB query failed. Ensure DATABASE_URL is set, then run: npm run db:push && npm run db:seed',
          error: (error as Error)?.message ?? 'Unknown error'
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Optional production fallback (opt-in via env)
    if (shouldProdFallback()) {
      return NextResponse.json(
        {
          sliders: mockSliders(),
          mock: true,
          hint: 'Production fallback enabled. Investigate DB connectivity and disable fallback once fixed.',
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
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

    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { name, type, isActive, autoPlay, autoPlayInterval, loop, items } = createSliderSchema.parse(body)

    // Create slider
    const slider = await db.slider.create({
      data: {
        id: randomUUID(),
        name,
        type,
        isActive,
        autoPlay,
        autoPlayInterval,
        loop
      }
    })

    // Create slider items if provided
    if (items && items.length > 0) {
      await db.sliderItem.createMany({
        data: items.map(item => ({
          id: randomUUID(),
          title: item.title,
          subtitle: item.subtitle,
          callToAction: item.callToAction,
          callToActionUrl: item.callToActionUrl,
          sortOrder: item.sortOrder,
          mediaId: item.mediaId,
          sliderId: slider.id,
        }))
      })
    }

    // Fetch the complete slider with items
    const completeSlider = await db.slider.findUnique({
      where: { id: slider.id },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Slider created successfully',
      slider: completeSlider
    })

  } catch (error) {
    console.error('Create slider error:', error)

    // Input validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.issues },
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
      // P2003: Foreign key constraint failed (e.g., mediaId does not exist)
      if (e.code === 'P2003') {
        return NextResponse.json(
          { code: 'FK_CONSTRAINT', message: 'Related record not found (check mediaId/sliderId)' },
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
