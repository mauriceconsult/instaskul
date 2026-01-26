// scripts/test-invitation.mjs
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
const { Pool } = pkg

// Load environment variables FIRST
config({ path: '.env.local' })

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment')
  console.error('   Make sure .env.local exists with DATABASE_URL')
  process.exit(1)
}

console.log('✅ DATABASE_URL loaded')
console.log('   Host:', new URL(process.env.DATABASE_URL).host)
console.log('')

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function testRedemption() {
  try {
    console.log('🔍 Looking for test invitation...\n')

    // Find an unused invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        status: 'ACTIVE',
        redemptions: {
          none: {}
        }
      }
    })

    if (!invitation) {
      console.log('❌ No available invitations to test')
      return
    }

    console.log('✅ Found invitation:', invitation.code)
    console.log('   Campaign:', invitation.campaign)
    console.log('   Tier:', invitation.tier)
    console.log('   Segment:', invitation.segment)
    console.log('')

    // Find a test user
    const testUser = await prisma.user.findFirst()

    if (!testUser) {
      console.log('❌ No users found to test with')
      console.log('   Please sign up a test user first')
      return
    }

    console.log('✅ Found test user:', testUser.email || testUser.id)
    console.log('')

    // Check if already redeemed
    const existing = await prisma.invitationRedemption.findFirst({
      where: {
        invitationId: invitation.id,
        userId: testUser.id
      }
    })

    if (existing) {
      console.log('⚠️  User already redeemed this invitation')
      console.log('   Redemption ID:', existing.id)
      console.log('   Created:', existing.createdAt)
      console.log('')
      console.log('✅ Test validation passed (using existing redemption)')
      return
    }

    // Create new redemption
    console.log('🔄 Creating test redemption...\n')

    const redemption = await prisma.invitationRedemption.create({
      data: {
        invitationId: invitation.id,
        userId: testUser.id
      },
      include: {
        invitation: {
          include: {
            market: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            marketId: true
          }
        }
      }
    })

    console.log('✅ Redemption created successfully!')
    console.log('   Redemption ID:', redemption.id)
    console.log('   Invitation Code:', redemption.invitation.code)
    console.log('   Market:', redemption.invitation.market.countryName)
    console.log('   User active status:', redemption.user.isActive)
    console.log('')

    // Clean up
    console.log('🧹 Cleaning up test redemption...')
    await prisma.invitationRedemption.delete({
      where: { id: redemption.id }
    })

    console.log('✅ Test cleanup complete')
    console.log('')
    console.log('🎉 All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
    console.error('\n   Full error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

testRedemption()