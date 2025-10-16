const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupTables() {
  console.log('🚀 Setting up Supabase tables...')
  
  // SQL statements to create tables
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'USER',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_sign_in_at TIMESTAMP WITH TIME ZONE
    );`,
    
    // Media Categories table
    `CREATE TABLE IF NOT EXISTS media_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Media Items table
    `CREATE TABLE IF NOT EXISTS media_items (
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
    );`,
    
    // Sliders table
    `CREATE TABLE IF NOT EXISTS sliders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      auto_play BOOLEAN DEFAULT TRUE,
      auto_play_interval INTEGER DEFAULT 5000,
      loop BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Slider Items table
    `CREATE TABLE IF NOT EXISTS slider_items (
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
  ]
  
  // Since we can't execute raw SQL directly via the client,
  // let's use the REST API with the service role key
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'
  
  for (const sql of tables) {
    try {
      console.log('Executing:', sql.split('(')[0])
      
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({
          query: sql
        })
      })
      
      if (response.ok) {
        console.log('✅ Table created successfully')
      } else {
        const error = await response.text()
        console.log('❌ Error:', error)
      }
      
    } catch (error) {
      console.error('❌ Execution error:', error.message)
    }
  }
  
  console.log('🎉 Table setup completed!')
}

setupTables()