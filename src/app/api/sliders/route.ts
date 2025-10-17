import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { z } from 'zod'
import { db } from '@/lib/db'

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

    return NextResponse.json({
      sliders
    })

  } catch (error) {
    console.error('Fetch sliders error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, isActive, autoPlay, autoPlayInterval, loop, items } = createSliderSchema.parse(body)

    // Create slider
    const slider = await db.slider.create({
      data: {
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
          ...item,
          sliderId: slider.id
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
