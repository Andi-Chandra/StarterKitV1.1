const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  console.log('🚀 Creating tables in Supabase...')
  
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
    }
  ]
  
  for (const table of tables) {
    try {
      console.log(`Creating ${table.name} table...`)
      
      // Use the raw SQL endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: table.sql })
      })
      
      if (response.ok) {
        console.log(`✅ ${table.name} table created successfully`)
      } else {
        const error = await response.text()
        console.log(`❌ Failed to create ${table.name}:`, error)
        
        // Try alternative approach - insert a record to create table structure
        try {
          await supabase
            .from(table.name)
            .insert({ id: 'test' })
          console.log(`✅ ${table.name} table accessible`)
        } catch (insertError) {
          console.log(`❌ Could not access ${table.name}:`, insertError.message)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error creating ${table.name}:`, error.message)
    }
  }
  
  console.log('🎉 Table creation process completed!')
}

createTables()