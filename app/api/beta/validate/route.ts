// app/api/beta/validate/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { InvitationService } from '@/lib/services/invitation.service'
import { prisma } from '@/lib/prisma' // Add this import

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    const { code } = await req.json()
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    
    // Verify the invitation code
    const result = await InvitationService.verifyInvitation(code)
    
    // If not valid, return early
    if (!result.valid) {
      return NextResponse.json(result)
    }
    
    // Additional user-specific checks if userId is provided
    if (userId && result.invitation) {
      // Check if user already redeemed this code
      const existingRedemption = await prisma.invitationRedemption.findFirst({
        where: {
          invitationId: result.invitation.id,
          userId
        }
      })
      
      if (existingRedemption) {
        return NextResponse.json({
          valid: false,
          message: 'You have already redeemed this invitation'
        })
      }
      
      // Check if user is already active
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true }
      })
      
      if (user?.isActive) {
        return NextResponse.json({
          valid: true,
          message: 'Invitation is valid',
          invitation: result.invitation,
          note: 'Your account is already active'
        })
      }
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[BETA_VALIDATE]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate invitation' },
      { status: 400 }
    )
  }
}