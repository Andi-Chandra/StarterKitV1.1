import { supabaseAdmin } from '../src/lib/supabase'

async function createTablesInSupabase() {
  console.log('🚀 Starting Supabase migration...')

  try {
    // Create Users table
    console.log('Creating users table...')
    const { error: usersError } = await supabaseAdmin.rpc('exec', {
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
    })
    
    if (usersError) {
      console.log('Users table error:', usersError.message)
      // Try using raw SQL through REST API
      await createTableViaAPI('users', `
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'USER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_sign_in_at TIMESTAMP WITH TIME ZONE
      `)
    } else {
      console.log('✅ Users table created')
    }

    // Create Media Categories table
    console.log('Creating media_categories table...')
    await createTableViaAPI('media_categories', `
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `)

    // Create Media Items table
    console.log('Creating media_items table...')
    await createTableViaAPI('media_items', `
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
    `)

    // Create Sliders table
    console.log('Creating sliders table...')
    await createTableViaAPI('sliders', `
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      auto_play BOOLEAN DEFAULT TRUE,
      auto_play_interval INTEGER DEFAULT 5000,
      loop BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `)

    // Create Slider Items table
    console.log('Creating slider_items table...')
    await createTableViaAPI('slider_items', `
      id TEXT PRIMARY KEY,
      title TEXT,
      subtitle TEXT,
      call_to_action TEXT,
      call_to_action_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      slider_id TEXT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
      media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE
    `)

    // Create Site Config table
    console.log('Creating site_config table...')
    await createTableViaAPI('site_config', `
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_by TEXT REFERENCES users(id)
    `)

    // Create Navigation Links table
    console.log('Creating navigation_links table...')
    await createTableViaAPI('navigation_links', `
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      is_external BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      parent_id TEXT REFERENCES navigation_links(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `)

    // Create Social Media Links table
    console.log('Creating social_media_links table...')
    await createTableViaAPI('social_media_links', `
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `)

    console.log('🎉 Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

async function createTableViaAPI(tableName: string, columns: string) {
  try {
    // Use Supabase REST API to create table
    const response = await fetch(`https://rcxjtnojxtugtpjtydzu.supabase.co/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({
        sql: `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.log(`Table ${tableName} creation via API failed:`, error)
    } else {
      console.log(`✅ ${tableName} table created`)
    }
  } catch (error) {
    console.error(`Error creating ${tableName}:`, error)
  }
}

createTablesInSupabase()