import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const updateSliderSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']).optional(),
  isActive: z.boolean().optional(),
  autoPlay: z.boolean().optional(),
  autoPlayInterval: z.number().optional(),
  loop: z.boolean().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sliderId = params.id
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

    // Update slider
    const updatedSlider = await db.slider.update({
      where: { id: sliderId },
      data: updateData,
      include: {
        items: {
          include: {
            media: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Slider updated successfully',
      slider: updatedSlider
    })

  } catch (error) {
    console.error('Update slider error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sliderId = params.id

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