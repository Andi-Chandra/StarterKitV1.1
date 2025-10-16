const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rcxjtnojxtugtpjtydzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSliders() {
  try {
    console.log('🔍 Testing sliders table...')
    
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
    
    if (error) {
      console.error('❌ Error fetching sliders:', error.message)
    } else {
      console.log('✅ Sliders data:', data)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testSliders()