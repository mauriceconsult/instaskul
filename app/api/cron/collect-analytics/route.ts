// app/api/cron/collect-analytics/route.ts

import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const markets = await prisma.market.findMany();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const market of markets) {
    const stats = await calculateMarketStats(market.id, today);
    
    await prisma.marketAnalytics.upsert({
      where: {
        marketId_date: {
          marketId: market.id,
          date: today
        }
      },
      update: stats,
      create: {
        marketId: market.id,
        date: today,
        ...stats
      }
    });
  }
  
  return NextResponse.json({ success: true });
}

async function calculateMarketStats(marketId: string, date: Date) {
  // Total users in market
  const totalUsers = await prisma.user.count({
    where: { marketId }
  });
  
  // Active users (used product in last 7 days)
  // You'd integrate with your activity tracking
  
  // New signups today
  const newSignups = await prisma.user.count({
    where: {
      marketId,
      createdAt: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });
  
  // Segment breakdown
  const segmentBreakdown = await prisma.user.groupBy({
    by: ['segment'],
    where: { marketId },
    _count: true
  });
  
  return {
    totalUsers,
    newSignups,
    segmentBreakdown: segmentBreakdown.reduce((acc, item) => {
      acc[item.segment] = item._count;
      return acc;
    }, {} as Record<string, number>)
  };
}