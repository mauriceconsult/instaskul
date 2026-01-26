// app/api/beta/redeem/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { InvitationService } from '@/lib/services/invitation.service'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { code } = await req.json()
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // If redeemInvitation only accepts code (check the actual signature)
    const result = await InvitationService.redeemInvitation(code)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[BETA_REDEEM]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to redeem invitation' },
      { status: 400 }
    )
  }
}