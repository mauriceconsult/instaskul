// app/admin/markets/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function MarketsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  if (!adminIds.includes(userId)) {
    redirect('/dashboard')
  }

  const markets = await prisma.market.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          users: true,
          invitations: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Market Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage global markets and regional availability
              </p>
            </div>
          </div>
          <Link href="/admin/markets/new">
            <Button>Add Market</Button>
          </Link>
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {markets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-2">No markets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first market to start expanding globally
            </p>
            <Link href="/admin/markets/new">
              <Button>Create Market</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {markets.map((market) => (
              <Link
                key={market.id}
                href={`/admin/markets/${market.id}`}
                className="block"
              >
                <div className="bg-white rounded-lg border p-6 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {market.countryName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {market.countryCode} • {market.region || 'No region'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        market.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : market.status === 'BETA'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {market.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">{market.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Users:</span>
                      <span className="font-medium">
                        {market._count.users}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invitations:</span>
                      <span className="font-medium">
                        {market._count.invitations}
                      </span>
                    </div>
                    {market.status === 'BETA' && market.maxBetaUsers && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Beta Slots:</span>
                        <span className="font-medium">
                          {market.currentBetaUsers} / {market.maxBetaUsers}
                        </span>
                      </div>
                    )}
                  </div>

                  {market.launchedAt && (
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Launched {new Date(market.launchedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
