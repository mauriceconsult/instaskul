// scripts/generate-beta-codes.ts
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

function generateInvitationCode(segment: string): string {
  const prefix = segment === 'STUDENT' ? 'STU' : 'EDU';
  const random = nanoid(8).toUpperCase();
  return `BETA-${prefix}-${random}`;
}

async function main() {
  // Configuration
  const COUNT = 10;
  const SEGMENT = 'EDUCATOR'; // Change to 'STUDENT' for student codes
  const MARKET_CODE = 'UG'; // Uganda market (change to 'KE' for Kenya)
  const EXPIRES_IN_DAYS = 14;
  
  const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  console.log(`\n🎫 Generating ${COUNT} ${SEGMENT} beta codes for ${MARKET_CODE}...\n`);

  // Get the market
  const market = await prisma.market.findUnique({
    where: { countryCode: MARKET_CODE }
  });

  if (!market) {
    throw new Error(`Market ${MARKET_CODE} not found. Please seed markets first.`);
  }

  console.log(`✓ Using market: ${market.countryName} (${market.countryCode})\n`);

  const codes: string[] = [];

  for (let i = 0; i < COUNT; i++) {
    const code = generateInvitationCode(SEGMENT);
    
    try {
      await prisma.invitation.create({
        data: {
          code,
          inviteLink: `https://yourapp.com/invite/${code}`,
          marketId: market.id,
          segment: SEGMENT as any,
          tier: 'BETA',
          maxUses: 1,
          currentUses: 0,
          status: 'ACTIVE',
          campaign: 'beta_launch_jan_2026',
          notes: 'Beta launch - January 2026',
          createdById: 'admin',
          expiresAt,
        },
      });
      
      codes.push(code);
      console.log(`✓ Created: ${code}`);
    } catch (error: any) {
      console.error(`✗ Failed: ${code} - ${error.message}`);
    }
  }

  console.log(`\n✅ Successfully generated ${codes.length} codes!\n`);
  console.log('📋 Your Beta Invitation Codes:');
  console.log('─'.repeat(60));
  codes.forEach((code, i) => {
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${code}`);
  });
  console.log('─'.repeat(60));
  console.log(`\n💾 All codes saved to database with ${EXPIRES_IN_DAYS}-day expiry`);
  console.log(`📍 Market: ${market.countryName} (${market.countryCode})`);
  console.log(`👥 Segment: ${SEGMENT}`);
  console.log(`🎯 Campaign: beta_launch_jan_2026\n`);

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('✅ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\n💡 Tip: Make sure you have run the market seed first:');
    console.error('   npx prisma db seed\n');
    process.exit(1);
  });