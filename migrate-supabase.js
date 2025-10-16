const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection test failed:', error.message)
      
      // Try to create a simple test table
      console.log('🔧 Attempting to create test table...')
      const { error: createError } = await supabase
        .rpc('exec', { 
          sql: 'CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_text TEXT);' 
        })
      
      if (createError) {
        console.log('❌ Table creation failed:', createError.message)
        
        // Try using raw SQL via REST API
        console.log('🌐 Trying REST API approach...')
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            query: 'CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_text TEXT);'
          })
        })
        
        if (response.ok) {
          console.log('✅ REST API connection successful!')
        } else {
          console.log('❌ REST API also failed:', await response.text())
        }
      } else {
        console.log('✅ Connection successful via RPC!')
      }
    } else {
      console.log('✅ Connection successful!')
      console.log('Existing tables:', data)
    }
    
  } catch (error) {
    console.error('❌ Connection test error:', error.message)
  }
}

testConnection()