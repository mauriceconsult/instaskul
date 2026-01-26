// scripts/test-db-connection.mjs
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n')
    
    // Try to connect
    const client = await pool.connect()
    console.log('✅ Database connected successfully!')
    
    // Test a simple query
    const result = await client.query('SELECT NOW()')
    console.log('✅ Query executed:', result.rows[0].now)
    
    client.release()
    
    console.log('\n🎉 Database is working!')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('\nCommon issues:')
    console.error('1. Check DATABASE_URL in .env.local')
    console.error('2. Verify database is running')
    console.error('3. Check firewall/network settings')
    console.error('4. Ensure SSL settings are correct')
  } finally {
    await pool.end()
  }
}

testConnection()