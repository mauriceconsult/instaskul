// app/api/admin/invitations/export/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(userId)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const invitations = await prisma.invitation.findMany({
      include: {
        redemptions: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const csvHeader = 'Code,Invite Link,Campaign,Segment,Tier,Status,Assigned To,Assigned Email,Sent Date,Redeemed By,Redeemed Date,Expires At,Notes\n'
    
    const csvRows = invitations.map(inv => {
      const redemption = inv.redemptions[0]
      const redeemedBy = redemption 
        ? `${redemption.user.firstName || ''} ${redemption.user.lastName || ''}`.trim()
        : ''
      const redeemedEmail = redemption?.user.email || ''
      const redeemedDate = redemption 
        ? new Date(redemption.redeemedAt).toISOString().split('T')[0]
        : ''
      const expiresAt = inv.expiresAt 
        ? new Date(inv.expiresAt).toISOString().split('T')[0]
        : ''

      return `"${inv.code}","${inv.inviteLink}","${inv.campaign || ''}","${inv.segment}","${inv.tier}","${inv.status}","","","","${redeemedBy}","${redeemedDate}","${expiresAt}","${inv.notes || ''}"`
    })

    const csv = csvHeader + csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="beta-invitations-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('[INVITATIONS_EXPORT]', error)
    return NextResponse.json(
      { error: 'Failed to export invitations' },
      { status: 500 }
    )
  }
}