// app/api/beta/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { InvitationService } from '@/lib/services/invitation.service';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ valid: false, error: 'Code required' });
  }
  
  const result = await InvitationService.validateCode(code);
  return NextResponse.json(result);
}