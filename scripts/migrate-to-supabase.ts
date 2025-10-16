import { supabaseAdmin } from '../src/lib/supabase'

async function migrateToSupabase() {
  try {
    console.log('Starting migration to Supabase...')

    // Create tables using SQL
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
      
      // Media categories table
      `CREATE TABLE IF NOT EXISTS media_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Media items table
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
      
      // Slider items table
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
      );`,
      
      // Site config table
      `CREATE TABLE IF NOT EXISTS site_config (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_by TEXT REFERENCES users(id)
      );`,
      
      // Navigation links table
      `CREATE TABLE IF NOT EXISTS navigation_links (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        is_external BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        parent_id TEXT REFERENCES navigation_links(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Social media links table
      `CREATE TABLE IF NOT EXISTS social_media_links (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    ]

    // Execute each table creation
    for (const sql of tables) {
      console.log('Executing:', sql.split('(')[0])
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql })
      if (error) {
        console.error('Error creating table:', error)
      }
    }

    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateToSupabase()