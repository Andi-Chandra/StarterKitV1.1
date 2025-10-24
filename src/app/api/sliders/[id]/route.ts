import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'

const updateSliderSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']).optional(),
  isActive: z.boolean().optional(),
  autoPlay: z.boolean().optional(),
  autoPlayInterval: z.number().optional(),
  loop: z.boolean().optional(),
  items: z.array(z.object({
    title: z.string().min(1, 'Item title is required'),
    subtitle: z.string().optional(),
    callToAction: z.string().optional(),
    callToActionUrl: z.string().optional(),
    mediaId: z.string().min(1, 'Media is required'),
    sortOrder: z.number()
  })).optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const sliderId = (await params).id
    const body = await request.json()
    const updateData = updateSliderSchema.parse(body)

    // Check if slider exists
    const slider = await db.slider.findUnique({
      where: { id: sliderId }
    })

    if (!slider) {
      return NextResponse.json(
        { message: 'Slider not found' },
        { status: 404 }
      )
    }

    // Update slider core fields
    const { items, ...sliderFields } = updateData as any

    // Perform updates in a transaction to keep items consistent
    const updatedSlider = await db.$transaction(async (tx) => {
      // Update slider main fields first
      await tx.slider.update({ where: { id: sliderId }, data: sliderFields })

      // If items provided, replace all items
      if (Array.isArray(items)) {
        await tx.sliderItem.deleteMany({ where: { sliderId } })
        if (items.length > 0) {
          await tx.sliderItem.createMany({
            data: items.map((it: any) => ({
              id: randomUUID(),
              title: it.title,
              subtitle: it.subtitle,
              callToAction: it.callToAction,
              callToActionUrl: it.callToActionUrl,
              sortOrder: it.sortOrder,
              mediaId: it.mediaId,
              sliderId,
            })),
          })
        }
      }

      // Return the fresh slider with items+media
      return tx.slider.findUnique({
        where: { id: sliderId },
        include: {
          items: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
        },
      })
    })

    return NextResponse.json({
      message: 'Slider updated successfully',
      slider: updatedSlider
    })

  } catch (error) {
    console.error('Update slider error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.issues },
        { status: 400 }
      )
    }

    const e = error as any
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2003') {
        return NextResponse.json(
          { code: 'FK_CONSTRAINT', message: 'Related media not found for one or more items' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { code: e.code, message: 'Database request error', detail: e.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
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
    const sliderId = (await params).id

    // Check if slider exists
    const slider = await db.slider.findUnique({
      where: { id: sliderId }
    })

    if (!slider) {
      return NextResponse.json(
        { message: 'Slider not found' },
        { status: 404 }
      )
    }

    // Delete slider items first (due to foreign key constraint)
    await db.sliderItem.deleteMany({
      where: { sliderId: sliderId }
    })

    // Delete slider
    await db.slider.delete({
      where: { id: sliderId }
    })

    return NextResponse.json({
      message: 'Slider deleted successfully'
    })

  } catch (error) {
    console.error('Delete slider error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sliderId = (await params).id
    const slider = await db.slider.findUnique({
      where: { id: sliderId },
      include: {
        items: {
          include: { media: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
    if (!slider) {
      return NextResponse.json({ message: 'Slider not found' }, { status: 404 })
    }
    return NextResponse.json({ slider })
  } catch (error) {
    console.error('Get slider error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
