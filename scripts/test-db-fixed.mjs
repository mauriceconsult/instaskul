// scripts/test-db-fixed.mjs
import { config } from 'dotenv'
config({ path: '.env.local' })

import pkg from 'pg'
const { Pool } = pkg

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found')
  process.exit(1)
}

console.log('✅ DATABASE_URL loaded from .env.local')
console.log('   Host:', new URL(process.env.DATABASE_URL).host)
console.log('')

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function test() {
  try {
    console.log('📡 Connecting to database...')
    const client = await pool.connect()
    
    console.log('✅ Connected successfully!')
    console.log('')
    
    console.log('🔍 Testing query...')
    const result = await client.query('SELECT NOW() as time, current_database() as db')
    
    console.log('✅ Query successful!')
    console.log('   Database:', result.rows[0].db)
    console.log('   Server time:', result.rows[0].time)
    console.log('')
    
    client.release()
    
    console.log('🎉 Database connection working!')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    
    if (error.message.includes('invalid connection string')) {
      console.error('\n💡 Fix: Check for trailing quotes or special characters in DATABASE_URL')
    }
    
  } finally {
    await pool.end()
  }
}

test()