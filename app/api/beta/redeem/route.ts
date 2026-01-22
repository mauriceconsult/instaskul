// app/api/beta/redeem/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvitationService } from '@/lib/services/invitation.service';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { code } = await req.json();
  
  const result = await InvitationService.redeemInvitation(code, userId, {
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent') || undefined
  });
  
  return NextResponse.json(result);
}