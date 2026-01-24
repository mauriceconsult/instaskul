// scripts/generate-beta-codes.js
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

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
  fs.writeFileSync('beta-invitations.csv', csvHeader + csvRows.join('\n'))
  console.log('📄 CSV exported to: beta-invitations.csv')

  // Export JSON
  fs.writeFileSync('beta-invitations.json', JSON.stringify(allInvitations, null, 2))
  console.log('📄 JSON exported to: beta-invitations.json\n')

  await prisma.$disconnect()
}

generateInvitationCodes()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })