// components/admin/invitation-stats.tsx
'use client'

interface StatsProps {
  stats: {
    total: number
    active: number
    redeemed: number
    expired: number
    redemptionRate: string
  }
  byCampaign: Record<string, { total: number; redeemed: number }>
}

export default function InvitationStats({ stats, byCampaign }: StatsProps) {
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Codes</div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.redeemed}</div>
          <div className="text-sm text-muted-foreground">Redeemed</div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
          <div className="text-sm text-muted-foreground">Expired</div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.redemptionRate}%</div>
          <div className="text-sm text-muted-foreground">Redemption Rate</div>
        </div>
      </div>

      {/* By Campaign */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Performance by Campaign</h3>
        <div className="space-y-3">
          {Object.entries(byCampaign).map(([campaign, data]) => {
            const rate = ((data.redeemed / data.total) * 100).toFixed(1)
            return (
              <div key={campaign} className="flex items-center justify-between">
                <span className="text-sm font-medium">{campaign}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {data.redeemed} / {data.total}
                  </span>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {rate}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}