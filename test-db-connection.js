const { Client } = require('pg');

// Prefer the environment DATABASE_URL so local/CI/Vercel secrets are authoritative.
const fallback = "postgresql://postgres:TiGgmHFIryDDeNv8@db.rcxjtnojxtugtpjtydzu.supabase.co:5432/postgres?sslmode=require";
const connectionString = process.env.DATABASE_URL || fallback;

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  Using fallback hard-coded connection string in test-db-connection.js.\nPlease set DATABASE_URL in your environment or copy .env.local -> .env to avoid auth errors.');
}

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