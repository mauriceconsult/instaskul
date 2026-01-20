import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateBetaCode(type: string): string {
  const prefix = type === 'STUDENT' ? 'STU' : 'EDU';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BETA-${prefix}-${random}`;
}

async function main() {
  // Configuration
  const COUNT = 10;
  const TYPE = 'EDUCATOR'; // Change to 'STUDENT' for student codes
  const EXPIRES_IN_DAYS = 14;
  
  const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  console.log(`\nÌæ´ Generating ${COUNT} ${TYPE} beta codes...\n`);

  const codes: string[] = [];

  for (let i = 0; i < COUNT; i++) {
    const code = generateBetaCode(TYPE);
    
    try {
      await prisma.betaInvite.create({
        data: {
          code,
          type: TYPE,
          createdBy: 'admin',
          notes: 'Beta launch - January 2026',
          expiresAt,
        },
      });
      
      codes.push(code);
      console.log(`‚úì Created: ${code}`);
    } catch (error: any) {
      console.error(`‚úó Failed: ${code} - ${error.message}`);
    }
  }

  console.log(`\n‚úÖ Successfully generated ${codes.length} codes!\n`);
  console.log('Ì≥ã Your Beta Codes:');
  console.log('‚îÄ'.repeat(60));
  codes.forEach((code, i) => {
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${code}`);
  });
  console.log('‚îÄ'.repeat(60));
  console.log(`\nÌ≤æ All codes saved to database with ${EXPIRES_IN_DAYS}-day expiry\n`);

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('‚úÖ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n‚ùå Script failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  });
