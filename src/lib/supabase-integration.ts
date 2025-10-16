import { supabase, supabaseAdmin } from './supabase'
import { db } from './db'

// Integration utilities for combining local SQLite with Supabase features

export interface SyncConfig {
  enableRealtime: boolean
  enableBackup: boolean
  enableAuth: boolean
}

export class SupabaseIntegration {
  private config: SyncConfig

  constructor(config: SyncConfig = {
    enableRealtime: false,
    enableBackup: false,
    enableAuth: false
  }) {
    this.config = config
  }

  // Authentication helpers
  async signIn(email: string, password: string) {
    if (!this.config.enableAuth) {
      throw new Error('Authentication is not enabled')
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  }

  async signUp(email: string, password: string, metadata?: any) {
    if (!this.config.enableAuth) {
      throw new Error('Authentication is not enabled')
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    return { data, error }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Real-time subscriptions
  subscribeToTable(tableName: string, callback: (payload: any) => void) {
    if (!this.config.enableRealtime) {
      console.warn('Real-time is not enabled')
      return null
    }

    return supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        callback
      )
      .subscribe()
  }

  // Backup functionality
  async backupToLocal() {
    if (!this.config.enableBackup) {
      throw new Error('Backup is not enabled')
    }

    try {
      // Fetch data from Supabase
      const { data: mediaItems, error: mediaError } = await supabaseAdmin
        .from('media_items')
        .select('*')
      
      if (mediaError) throw mediaError

      // Sync to local SQLite
      for (const item of mediaItems || []) {
        await db.mediaItem.upsert({
          where: { id: item.id },
          update: {
            title: item.title,
            description: item.description,
            fileUrl: item.file_url,
            fileType: item.file_type,
            fileSize: item.file_size,
            dimensions: item.dimensions,
            isFeatured: item.is_featured,
            sortOrder: item.sort_order
          },
          create: {
            id: item.id,
            title: item.title,
            description: item.description,
            fileUrl: item.file_url,
            fileType: item.file_type,
            fileSize: item.file_size,
            dimensions: item.dimensions,
            isFeatured: item.is_featured,
            sortOrder: item.sort_order
          }
        })
      }

      console.log('Backup completed successfully')
    } catch (error) {
      console.error('Backup failed:', error)
      throw error
    }
  }

  async backupToSupabase() {
    if (!this.config.enableBackup) {
      throw new Error('Backup is not enabled')
    }

    try {
      // Fetch data from local SQLite
      const mediaItems = await db.mediaItem.findMany()

      // Sync to Supabase
      for (const item of mediaItems) {
        const { error } = await supabaseAdmin
          .from('media_items')
          .upsert({
            id: item.id,
            title: item.title,
            description: item.description,
            file_url: item.fileUrl,
            file_type: item.fileType,
            file_size: item.fileSize,
            dimensions: item.dimensions,
            is_featured: item.isFeatured,
            sort_order: item.sortOrder,
            created_at: item.createdAt,
            updated_at: item.updatedAt
          })

        if (error) throw error
      }

      console.log('Backup to Supabase completed successfully')
    } catch (error) {
      console.error('Backup to Supabase failed:', error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    if (!this.config.enableAuth) {
      return null
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!this.config.enableAuth) {
      return () => {}
    }
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Create default integration instance
export const supabaseIntegration = new SupabaseIntegration({
  enableRealtime: false, // Set to true to enable real-time features
  enableBackup: false,   // Set to true to enable backup features
  enableAuth: false      // Set to true to enable authentication
})

// Convenience functions for common operations
export const signIn = (email: string, password: string) => 
  supabaseIntegration.signIn(email, password)

export const signUp = (email: string, password: string, metadata?: any) => 
  supabaseIntegration.signUp(email, password, metadata)

export const signOut = () => 
  supabaseIntegration.signOut()

export const getCurrentUser = () => 
  supabaseIntegration.getCurrentUser()

export const onAuthStateChange = (callback: (event: string, session: any) => void) => 
  supabaseIntegration.onAuthStateChange(callback)