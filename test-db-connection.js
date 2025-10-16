const { Client } = require('pg');

const connectionString = "postgresql://postgres:TiGgmHFIryDDeNv8@db.rcxjtnojxtugtpjtydzu.supabase.co:5432/postgres?sslmode=require";

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();