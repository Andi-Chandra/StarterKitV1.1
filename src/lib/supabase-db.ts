import { getSupabaseAdmin } from './supabase'
const supabaseAdmin = getSupabaseAdmin()

// Hybrid database operations using Supabase client
// This replaces Prisma operations with Supabase operations

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  lastSignInAt?: string
}

export interface MediaCategory {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface MediaItem {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
  fileSize?: number
  dimensions?: string
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  categoryId?: string
  createdBy?: string
  category?: MediaCategory
  creator?: User
}

export interface Slider {
  id: string
  name: string
  type: 'IMAGE' | 'VIDEO' | 'MIXED'
  isActive: boolean
  autoPlay: boolean
  autoPlayInterval: number
  loop: boolean
  createdAt: string
  updatedAt: string
  items?: SliderItem[]
}

export interface SliderItem {
  id: string
  title?: string
  subtitle?: string
  callToAction?: string
  callToActionUrl?: string
  sortOrder: number
  createdAt: string
  sliderId: string
  mediaId: string
  media?: MediaItem
}

// Database operations
export const db = {
  // Users
  user: {
    async findMany(): Promise<User[]> {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
      if (error) throw error
      return data || []
    },
    
    async findUnique({ where }: { where: { id: string } }): Promise<User | null> {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', where.id)
        .single()
      if (error) return null
      return data
    },
    
    async create({ data }: { data: Partial<User> }): Promise<User> {
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result
    }
  },

  // Media Categories
  mediaCategory: {
    async findMany(): Promise<MediaCategory[]> {
      const { data, error } = await supabaseAdmin
        .from('media_categories')
        .select('*')
      if (error) throw error
      return data || []
    },
    
    async create({ data }: { data: Partial<MediaCategory> }): Promise<MediaCategory> {
      const { data: result, error } = await supabaseAdmin
        .from('media_categories')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result
    }
  },

  // Media Items
  mediaItem: {
    async findMany({ 
      include = {}, 
      where = {}, 
      orderBy = {},
      take,
      skip 
    }: {
      include?: { category?: boolean, creator?: boolean }
      where?: any
      orderBy?: any
      take?: number
      skip?: number
    } = {}): Promise<MediaItem[]> {
      let query = supabaseAdmin.from('media_items').select('*')
      
      if (include.category) {
        query = query.select('*, media_categories(*)')
      }
      
      if (include.creator) {
        query = query.select('*, users(*)')
      }
      
      if (take) query = query.limit(take)
      if (skip) query = query.offset(skip)
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    
    async findUnique({ where }: { where: { id: string } }): Promise<MediaItem | null> {
      const { data, error } = await supabaseAdmin
        .from('media_items')
        .select('*')
        .eq('id', where.id)
        .single()
      if (error) return null
      return data
    },
    
    async create({ data }: { data: Partial<MediaItem> }): Promise<MediaItem> {
      const { data: result, error } = await supabaseAdmin
        .from('media_items')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result
    },
    
    async update({ where, data }: { where: { id: string }, data: Partial<MediaItem> }): Promise<MediaItem> {
      const { data: result, error } = await supabaseAdmin
        .from('media_items')
        .update(data)
        .eq('id', where.id)
        .select()
        .single()
      if (error) throw error
      return result
    },
    
    async delete({ where }: { where: { id: string } }): Promise<void> {
      const { error } = await supabaseAdmin
        .from('media_items')
        .delete()
        .eq('id', where.id)
      if (error) throw error
    },
    
    async count(): Promise<number> {
      const { count, error } = await supabaseAdmin
        .from('media_items')
        .select('*', { count: 'exact', head: true })
      if (error) throw error
      return count || 0
    }
  },

  // Sliders
  slider: {
    async findMany({ 
      include = {}, 
      where = {}, 
      orderBy = {}
    }: {
      include?: { items?: boolean }
      where?: any
      orderBy?: any
    } = {}): Promise<Slider[]> {
      let query = supabaseAdmin.from('sliders').select('*')
      
      if (include.items) {
        query = query.select(`
          *,
          slider_items(
            *,
            media_items(*)
          )
        `)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    
    async findUnique({ where, include = {} }: { 
      where: { id: string }
      include?: { items?: boolean }
    }): Promise<Slider | null> {
      let query = supabaseAdmin
        .from('sliders')
        .select('*')
        .eq('id', where.id)
      
      if (include.items) {
        query = query.select(`
          *,
          slider_items(
            *,
            media_items(*)
          )
        `)
      }
      
      const { data, error } = await query.single()
      if (error) return null
      return data
    },
    
    async create({ data }: { data: Partial<Slider> }): Promise<Slider> {
      const { data: result, error } = await supabaseAdmin
        .from('sliders')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result
    },
    
    async update({ where, data }: { where: { id: string }, data: Partial<Slider> }): Promise<Slider> {
      const { data: result, error } = await supabaseAdmin
        .from('sliders')
        .update(data)
        .eq('id', where.id)
        .select()
        .single()
      if (error) throw error
      return result
    },
    
    async delete({ where }: { where: { id: string } }): Promise<void> {
      const { error } = await supabaseAdmin
        .from('sliders')
        .delete()
        .eq('id', where.id)
      if (error) throw error
    }
  },

  // Slider Items
  sliderItem: {
    async createMany({ data }: { data: Partial<SliderItem>[] }): Promise<void> {
      const { error } = await supabaseAdmin
        .from('slider_items')
        .insert(data)
      if (error) throw error
    },
    
    async deleteMany({ where }: { where: { sliderId: string } }): Promise<void> {
      const { error } = await supabaseAdmin
        .from('slider_items')
        .delete()
        .eq('slider_id', where.sliderId)
      if (error) throw error
    }
  }
}
