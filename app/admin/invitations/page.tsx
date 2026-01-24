// app/admin/invitations/page.tsx
export const runtime = 'nodejs'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import InvitationStats from '@/components/admin/invitation-stats'
import InvitationTrackingTable from '@/components/admin/invitation-tracking-table'

export default async function AdminInvitationsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Check admin access
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  if (!adminIds.includes(userId)) {
    redirect('/dashboard')
  }

  // Get all invitations with redemption data
  const invitations = await prisma.invitation.findMany({
    include: {
      market: true,
      redemptions: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      },
      _count: {
        select: {
          redemptions: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate stats
  const stats = {
    total: invitations.length,
    active: invitations.filter(i => i.status === 'ACTIVE').length,
    redeemed: invitations.filter(i => i._count.redemptions > 0).length,
    expired: invitations.filter(i => 
      i.expiresAt && new Date(i.expiresAt) < new Date()
    ).length,
    redemptionRate: (
      (invitations.filter(i => i._count.redemptions > 0).length / invitations.length) * 100
    ).toFixed(1)
  }

  const byCampaign = invitations.reduce((acc, inv) => {
    const campaign = inv.campaign || 'Unknown'
    if (!acc[campaign]) {
      acc[campaign] = { total: 0, redeemed: 0 }
    }
    acc[campaign].total++
    if (inv._count.redemptions > 0) {
      acc[campaign].redeemed++
    }
    return acc
  }, {} as Record<string, { total: number; redeemed: number }>)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beta Invitation Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and manage invitation codes
          </p>
        </div>
        <a 
          href="/api/admin/invitations/export"
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Export CSV
        </a>
      </div>

      <InvitationStats stats={stats} byCampaign={byCampaign} />
      
      <InvitationTrackingTable invitations={invitations} />
    </div>
  )
}