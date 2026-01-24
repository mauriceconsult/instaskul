// app/admin/invitations/page.tsx
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import InvitationTrackingTable from '@/components/admin/invitation-tracking-table'
import InvitationStats from '@/components/admin/invitation-stats'

export default async function AdminInvitationsPage() {
  // Auth check is in layout, so we can skip it here
  
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
    redemptionRate: invitations.length > 0
      ? ((invitations.filter(i => i._count.redemptions > 0).length / invitations.length) * 100).toFixed(1)
      : '0'
  }

  // Calculate by campaign
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
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beta Invitation Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and manage invitation codes
          </p>
        </div>
        <a 
          href="/api/admin/invitations/export"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <InvitationStats stats={stats} byCampaign={byCampaign} />
      
      <InvitationTrackingTable invitations={invitations} />
    </main>
  )
}