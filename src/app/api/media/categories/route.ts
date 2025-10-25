import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
  description: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const categories = await db.mediaCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
    )

  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
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
    const { name, slug, description } = createCategorySchema.parse(body)

    // Check if category with same slug already exists
    const existingCategory = await db.mediaCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    // Create category
    const category = await db.mediaCategory.create({
      data: {
        id: randomUUID(),
        name,
        slug,
        description
      }
    })

    return NextResponse.json({
      message: 'Category created successfully',
      category
    })

  } catch (error) {
    console.error('Create category error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
