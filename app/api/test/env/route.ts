// app/api/test/env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasCronSecret: !!process.env.CRON_SECRET,
    hasAdminIds: !!process.env.ADMIN_USER_IDS,
    cronSecretLength: process.env.CRON_SECRET?.length || 0,
    adminCount: process.env.ADMIN_USER_IDS?.split(',').length || 0,
    // Don't return actual values for security!
  });
}