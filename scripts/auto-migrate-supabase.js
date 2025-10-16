const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function migrateToSupabase() {
  console.log('🚀 Starting automatic Supabase migration...')

  const tables = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'USER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_sign_in_at TIMESTAMP WITH TIME ZONE
      );`
    },
    {
      name: 'media_categories',
      sql: `CREATE TABLE IF NOT EXISTS media_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    },
    {
      name: 'media_items',
      sql: `CREATE TABLE IF NOT EXISTS media_items (
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
      );`
    },
    {
      name: 'sliders',
      sql: `CREATE TABLE IF NOT EXISTS sliders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        auto_play BOOLEAN DEFAULT TRUE,
        auto_play_interval INTEGER DEFAULT 5000,
        loop BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    },
    {
      name: 'slider_items',
      sql: `CREATE TABLE IF NOT EXISTS slider_items (
        id TEXT PRIMARY KEY,
        title TEXT,
        subtitle TEXT,
        call_to_action TEXT,
        call_to_action_url TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        slider_id TEXT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
        media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE
      );`
    },
    {
      name: 'site_config',
      sql: `CREATE TABLE IF NOT EXISTS site_config (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_by TEXT REFERENCES users(id)
      );`
    },
    {
      name: 'navigation_links',
      sql: `CREATE TABLE IF NOT EXISTS navigation_links (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        is_external BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        parent_id TEXT REFERENCES navigation_links(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    },
    {
      name: 'social_media_links',
      sql: `CREATE TABLE IF NOT EXISTS social_media_links (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    }
  ]

  let successCount = 0
  let failCount = 0

  for (const table of tables) {
    console.log(`Creating ${table.name} table...`)
    
    const result = await executeSQL(table.sql)
    
    if (result.success) {
      console.log(`✅ ${table.name} table created successfully`)
      successCount++
    } else {
      console.log(`❌ Failed to create ${table.name} table:`, result.error)
      failCount++
    }
  }

  console.log('=' .repeat(60))
  console.log(`🎉 Migration completed!`)
  console.log(`✅ Successful: ${successCount} tables`)
  console.log(`❌ Failed: ${failCount} tables`)

  if (failCount > 0) {
    console.log('\n💡 You can manually run the SQL commands in your Supabase Dashboard > SQL Editor')
    console.log('📝 The SQL commands are in the scripts/migrate-supabase.js output')
  }
}

migrateToSupabase()