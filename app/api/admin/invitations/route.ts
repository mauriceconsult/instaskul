// app/api/admin/invitations/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/beta-helpers'
import { prisma } from '@/lib/prisma'
import { UserSegment, AccessTier } from '@prisma/client'

interface GenerateInvitationRequest {
  marketId: string
  segment: UserSegment
  tier: AccessTier
  count: number
  maxUses: number // -1 for unlimited
  expiresAt?: Date
  campaign?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAccess()
    if ('error' in auth) return auth.error

    const body: GenerateInvitationRequest = await req.json()
    const { marketId, segment, tier, count, maxUses, expiresAt, campaign, notes } = body

    if (!marketId || !segment || !tier || !count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const market = await prisma.market.findUnique({
      where: { id: marketId }
    })

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      )
    }

    // Generate invitation codes
    const invitations = await Promise.all(
      Array.from({ length: count }, async () => {
        const code = generateInviteCode()
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/beta/join?code=${code}`
        
        const invitation = await prisma.invitation.create({
          data: {
            code,
            inviteLink, // Add this field
            marketId,
            segment,
            tier,
            maxUses,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            campaign,
            notes,
            createdById: auth.userId,
            status: 'ACTIVE'
          }
        })

        return {
          code: invitation.code,
          inviteLink: invitation.inviteLink,
          expiresAt: invitation.expiresAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      invitations
    })
  } catch (error) {
    console.error('[ADMIN_INVITATIONS_GENERATE]', error)
    return NextResponse.json(
      { error: 'Failed to generate invitations' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAccess()
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const marketId = searchParams.get('marketId')
    const status = searchParams.get('status')

    const invitations = await prisma.invitation.findMany({
      where: {
        ...(marketId && { marketId }),
        ...(status && { status: status as any })
      },
      include: {
        market: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('[ADMIN_INVITATIONS_LIST]', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

function generateInviteCode(): string {
  return `BETA-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
}