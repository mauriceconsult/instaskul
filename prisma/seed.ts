// prisma/seed.ts

import { PrismaClient, MarketStatus, UserSegment } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Kenya market (your first beta)
  const kenya = await prisma.market.upsert({
    where: { countryCode: 'KE' },
    update: {},
    create: {
      countryCode: 'KE',
      countryName: 'Kenya',
      region: 'East Africa',
      status: MarketStatus.BETA,
      allowedSegments: [UserSegment.CONSUMER, UserSegment.SMB],
      maxBetaUsers: 500,
      paymentMethods: ['mpesa', 'card'],
      currency: 'KES',
      pricingConfig: {
        monthly: 999,
        annual: 9990
      }
    }
  });
  
  // Create Uganda market (upcoming)
  const uganda = await prisma.market.upsert({
    where: { countryCode: 'UG' },
    update: {},
    create: {
      countryCode: 'UG',
      countryName: 'Uganda',
      region: 'East Africa',
      status: MarketStatus.PLANNED,
      allowedSegments: [UserSegment.CONSUMER, UserSegment.SMB],
      maxBetaUsers: 300,
      paymentMethods: ['mobile_money', 'card'],
      currency: 'UGX',
      pricingConfig: {
        monthly: 37000,
        annual: 370000
      }
    }
  });

  console.log({ kenya, uganda });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());