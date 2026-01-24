// scripts/generate-beta-codes.mjs
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config() // Also load .env if exists

const { Pool } = pg

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables')
  console.log('Please check your .env.local or .env file')
  process.exit(1)
}

console.log('✅ Database URL loaded')

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const BATCHES = [
  { campaign: 'PERSONAL_EMAIL', count: 20, prefix: 'PERSONAL', tier: 'BETA', segment: 'EDUCATOR' },
  { campaign: 'TWITTER', count: 15, prefix: 'TWITTER', tier: 'BETA', segment: 'STUDENT' },
  { campaign: 'LINKEDIN', count: 15, prefix: 'LINKEDIN', tier: 'BETA', segment: 'EDUCATOR' },
  { campaign: 'WHATSAPP', count: 10, prefix: 'WHATSAPP', tier: 'BETA', segment: 'STUDENT' },
  { campaign: 'FACEBOOK_GROUPS', count: 15, prefix: 'FBGROUP', tier: 'BETA', segment: 'STUDENT' },
  { campaign: 'REFERRAL', count: 10, prefix: 'REFERRAL', tier: 'BETA', segment: 'STUDENT' },
  { campaign: 'SCHOOL_DEMO', count: 10, prefix: 'SCHOOL', tier: 'BETA', segment: 'EDUCATOR' },
  { campaign: 'SCHOOL_ADMIN', count: 5, prefix: 'ADMIN', tier: 'BETA', segment: 'EDUCATION' },
]

function generateRandomString(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateInvitationCodes() {
  console.log('🚀 Generating invitation codes...\n')

  let market = await prisma.market.findUnique({
    where: { countryCode: 'UG' }
  })

  if (!market) {
    market = await prisma.market.create({
      data: {
        countryCode: 'UG',
        countryName: 'Uganda',
        region: 'East Africa',
        status: 'BETA',
        allowedSegments: ['STUDENT', 'EDUCATOR', 'EDUCATION', 'CONSUMER'],
        maxBetaUsers: 1000,
        paymentMethods: ['MOBILE_MONEY', 'CARD'],
        currency: 'UGX',
        pricingConfig: {},
        featureFlags: {}
      }
    })
    console.log('✅ Created Uganda market\n')
  }

  const allInvitations = []
  let totalGenerated = 0

  for (const batch of BATCHES) {
    console.log(`📦 Generating ${batch.count} codes for ${batch.campaign}...`)
    
    for (let i = 0; i < batch.count; i++) {
      const code = `${batch.prefix}-${generateRandomString(4)}-${generateRandomString(4)}`
      const inviteLink = `https://instaskul.com/beta/join?code=${code}`

      try {
        const invitation = await prisma.invitation.create({
          data: {
            code,
            inviteLink,
            marketId: market.id,
            segment: batch.segment,
            tier: batch.tier,
            maxUses: 1,
            status: 'ACTIVE',
            campaign: batch.campaign,
            notes: `Generated for ${batch.campaign} campaign`,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        })

        allInvitations.push({
          code: invitation.code,
          inviteLink: invitation.inviteLink,
          campaign: batch.campaign,
          segment: batch.segment,
          tier: batch.tier,
          status: 'Generated',
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt
        })

        totalGenerated++
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`)
      }
    }

    console.log(`   ✅ Generated ${batch.count} codes\n`)
  }

  console.log(`\n🎉 Total codes generated: ${totalGenerated}\n`)

  // Export CSV
  const csvHeader = 'Code,Invite Link,Campaign,Segment,Tier,Status,Assigned To,Assigned Email,Sent Date,Redeemed Date,Expires At,Notes\n'
  const csvRows = allInvitations.map(inv => 
    `"${inv.code}","${inv.inviteLink}","${inv.campaign}","${inv.segment}","${inv.tier}","Available","","","","","${inv.expiresAt.toISOString().split('T')[0]}",""`
  )
  const csvPath = path.join(process.cwd(), 'beta-invitations.csv')
  fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n'))
  console.log(`📄 CSV exported to: ${csvPath}`)

  // Export JSON
  const jsonPath = path.join(process.cwd(), 'beta-invitations.json')
  fs.writeFileSync(jsonPath, JSON.stringify(allInvitations, null, 2))
  console.log(`📄 JSON exported to: ${jsonPath}`)

  // Print summary
  console.log('\n📊 INVITATION CODE SUMMARY')
  console.log('='.repeat(60))
  
  const byCampaign = {}
  allInvitations.forEach(inv => {
    byCampaign[inv.campaign] = (byCampaign[inv.campaign] || 0) + 1
  })

  Object.entries(byCampaign).forEach(([campaign, count]) => {
    console.log(`   ${campaign.padEnd(30)} ${count} codes`)
  })

  console.log('='.repeat(60))
  console.log(`   TOTAL: ${allInvitations.length} codes`)
  console.log('='.repeat(60))
  
  console.log('\n📋 Next Steps:')
  console.log('   1. Open beta-invitations.csv in Excel/Google Sheets')
  console.log('   2. Assign codes to specific people')
  console.log('   3. Track distribution and redemption')
  console.log('   4. Monitor via admin dashboard at instaskul.com/admin/invitations\n')

  await prisma.$disconnect()
}

generateInvitationCodes()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })