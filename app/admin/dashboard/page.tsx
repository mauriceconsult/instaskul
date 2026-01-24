// app/admin/dashboard/page.tsx
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Ticket, Globe, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  // Get quick stats
  const [
    totalUsers,
    totalInvitations,
    activeInvitations,
    totalMarkets
  ] = await Promise.all([
    prisma.user.count(),
    prisma.invitation.count(),
    prisma.invitation.count({ where: { status: 'ACTIVE' } }),
    prisma.market.count()
  ])

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Invitations',
      value: totalInvitations,
      icon: Ticket,
      color: 'text-green-600'
    },
    {
      title: 'Active Invitations',
      value: activeInvitations,
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'Markets',
      value: totalMarkets,
      icon: Globe,
      color: 'text-purple-600'
    }
  ]

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of InstaSkul beta metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a 
              href="/admin/invitations" 
              className="block p-3 border rounded hover:bg-muted transition-colors"
            >
              Manage Invitations →
            </a>
            <a 
              href="/admin/markets" 
              className="block p-3 border rounded hover:bg-muted transition-colors"
            >
              Manage Markets →
            </a>
            <a 
              href="/api/admin/invitations/export" 
              className="block p-3 border rounded hover:bg-muted transition-colors"
            >
              Export Invitation Data →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
