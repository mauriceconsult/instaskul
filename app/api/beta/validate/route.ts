// app/api/beta/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvitationService } from '@/lib/services/invitation.service';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  const { code } = await req.json();
  
  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }
  
  // Use verifyInvitation instead of validateCode
  const result = await InvitationService.verifyInvitation(code, userId || undefined);
  
  return NextResponse.json(result);
}