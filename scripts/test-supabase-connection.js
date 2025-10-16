const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection by checking if we can access the API
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1)

    if (error) {
      console.log('❌ Connection test failed:', error.message)
      
      // Try a different approach - test auth
      const { data: authData, error: authError } = await supabase.auth.getSession()
      if (authError) {
        console.log('❌ Auth test failed:', authError.message)
      } else {
        console.log('✅ Auth connection successful')
      }
    } else {
      console.log('✅ Database connection successful!')
      console.log('📋 Found tables:', data?.length || 0)
    }

    // Test creating a simple table via direct SQL
    console.log('\n🔨 Testing table creation...')
    
    // Use the raw SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      }
    })

    console.log('API Response status:', response.status)

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testConnection()