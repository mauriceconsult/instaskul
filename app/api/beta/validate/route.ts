// app/api/beta/validate/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { InvitationService } from '@/lib/services/invitation.service'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    const { code } = await req.json()
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    
    const result = await InvitationService.verifyInvitation(code, userId || undefined)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[BETA_VALIDATE]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate invitation' },
      { status: 400 }
    )
  }
}