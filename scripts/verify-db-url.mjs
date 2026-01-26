// scripts/verify-db-url.mjs
import { config } from 'dotenv'

// Load .env.local
config({ path: '.env.local' })

console.log('🔍 Checking DATABASE_URL...\n')

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

const url = process.env.DATABASE_URL

console.log('✅ DATABASE_URL found')
console.log('   Length:', url.length, 'characters')
console.log('   First 30 chars:', url.slice(0, 30))
console.log('   Last 30 chars:', url.slice(-30))
console.log('')

// Check for common issues
const issues = []

if (url.includes("'")) {
  issues.push("⚠️  Contains single quote (') - this might break the connection")
}

if (url.startsWith("'") || url.endsWith("'")) {
  issues.push("❌ Starts or ends with single quote - REMOVE IT!")
}

if (url.startsWith('"') || url.endsWith('"')) {
  issues.push("ℹ️  Note: Quotes in .env file should be: DATABASE_URL=\"...\" not DATABASE_URL='...'")
}

if (!url.includes('postgresql://')) {
  issues.push("❌ Doesn't start with postgresql://")
}

if (!url.includes('sslmode=require')) {
  issues.push("⚠️  Missing sslmode=require (might be needed for Neon)")
}

if (issues.length > 0) {
  console.log('🔧 Issues found:\n')
  issues.forEach(issue => console.log('   ' + issue))
  console.log('')
} else {
  console.log('✅ DATABASE_URL looks good!')
}

// Try to parse as URL
console.log('🔗 Parsing connection string...\n')

try {
  const parsedUrl = new URL(url)
  console.log('✅ URL is valid')
  console.log('   Protocol:', parsedUrl.protocol)
  console.log('   Host:', parsedUrl.host)
  console.log('   Database:', parsedUrl.pathname.slice(1))
  console.log('   Username:', parsedUrl.username)
  console.log('   Password:', parsedUrl.password ? '***' + parsedUrl.password.slice(-4) : 'none')
  console.log('   SSL Mode:', parsedUrl.searchParams.get('sslmode'))
  console.log('   Channel Binding:', parsedUrl.searchParams.get('channel_binding'))
  console.log('')
  console.log('🎉 Connection string is properly formatted!')
} catch (error) {
  console.error('❌ Failed to parse URL:', error.message)
  console.error('   This means the DATABASE_URL is malformed')
  console.error('\n   It should look like:')
  console.error('   postgresql://username:password@host:5432/database?sslmode=require')
}