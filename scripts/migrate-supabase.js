const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateToSupabase() {
  console.log('🚀 Starting Supabase migration...')

  try {
    // Test connection
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.log('Connection test result:', error.message)
    }

    // Create tables using SQL through Supabase SQL Editor or REST API
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'USER',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_sign_in_at TIMESTAMP WITH TIME ZONE
          );
        `
      },
      {
        name: 'media_categories',
        sql: `
          CREATE TABLE IF NOT EXISTS media_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'media_items',
        sql: `
          CREATE TABLE IF NOT EXISTS media_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            file_url TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            dimensions TEXT,
            is_featured BOOLEAN DEFAULT FALSE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            category_id TEXT REFERENCES media_categories(id),
            created_by TEXT REFERENCES users(id)
          );
        `
      },
      {
        name: 'sliders',
        sql: `
          CREATE TABLE IF NOT EXISTS sliders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            auto_play BOOLEAN DEFAULT TRUE,
            auto_play_interval INTEGER DEFAULT 5000,
            loop BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'slider_items',
        sql: `
          CREATE TABLE IF NOT EXISTS slider_items (
            id TEXT PRIMARY KEY,
            title TEXT,
            subtitle TEXT,
            call_to_action TEXT,
            call_to_action_url TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            slider_id TEXT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
            media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE
          );
        `
      },
      {
        name: 'site_config',
        sql: `
          CREATE TABLE IF NOT EXISTS site_config (
            id TEXT PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            description TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_by TEXT REFERENCES users(id)
          );
        `
      },
      {
        name: 'navigation_links',
        sql: `
          CREATE TABLE IF NOT EXISTS navigation_links (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            is_external BOOLEAN DEFAULT FALSE,
            sort_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            parent_id TEXT REFERENCES navigation_links(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'social_media_links',
        sql: `
          CREATE TABLE IF NOT EXISTS social_media_links (
            id TEXT PRIMARY KEY,
            platform TEXT NOT NULL,
            url TEXT NOT NULL,
            icon_name TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ]

    console.log('✅ Migration script prepared. Tables to create:', tables.map(t => t.name).join(', '))
    console.log('📝 Please run these SQL commands in your Supabase SQL Editor:')
    console.log('=' .repeat(60))
    
    tables.forEach(table => {
      console.log(`-- Create ${table.name} table`)
      console.log(table.sql)
      console.log('')
    })

    console.log('=' .repeat(60))
    console.log('🎉 Migration SQL generated successfully!')
    console.log('💡 Copy and paste these SQL commands into your Supabase Dashboard > SQL Editor')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

migrateToSupabase()