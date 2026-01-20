// app/api/cron/graduate-users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GraduationService } from '@/lib/services/graduation.service';

/**
 * Cron job endpoint to automatically graduate eligible users
 * 
 * Set up in Vercel Cron Jobs:
 * - Path: /api/cron/graduate-users
 * - Schedule: 0 2 * * * (Daily at 2 AM UTC)
 * 
 * Or use external cron services like:
 * - cron-job.org
 * - EasyCron
 * - GitHub Actions
 */
export async function GET(req: NextRequest) {
  // Verify the request is from your cron service
  const authHeader = req.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    console.error('Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Starting automated user graduation...');

    // Run graduation with default criteria
    const result = await GraduationService.graduateEligibleUsers();

    console.log('Graduation completed:', result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    console.error('Error in graduation cron job:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Optional: Support POST for manual triggering from admin dashboard
export async function POST(req: NextRequest) {
  // Add admin authentication here
  // const { userId } = auth();
  // if (!await isAdmin(userId)) return 401

  try {
    const body = await req.json();
    const customCriteria = body.criteria;

    const result = await GraduationService.graduateEligibleUsers(customCriteria);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}