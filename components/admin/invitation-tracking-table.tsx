// components/admin/invitation-tracking-table.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface Invitation {
  id: string
  code: string
  inviteLink: string
  campaign: string | null
  status: string
  segment: string
  tier: string
  assignedEmail: string | null
  expiresAt: Date | null
  createdAt: Date
  redemptions: Array<{
    id: string
    redeemedAt: Date
    user: {
      email: string | null
      firstName: string | null
      lastName: string | null
    }
  }>
  _count: {
    redemptions: number
  }
}

export default function InvitationTrackingTable({ 
  invitations 
}: { 
  invitations: Invitation[] 
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'redeemed' | 'expired'>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const filteredInvitations = invitations.filter(inv => {
    const matchesSearch = inv.code.toLowerCase().includes(search.toLowerCase()) ||
                         inv.campaign?.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? inv.status === 'ACTIVE' && inv._count.redemptions === 0 :
      filter === 'redeemed' ? inv._count.redemptions > 0 :
      filter === 'expired' ? inv.expiresAt && new Date(inv.expiresAt) < new Date() : true

    return matchesSearch && matchesFilter
  })

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by code or campaign..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filter === 'redeemed' ? 'default' : 'outline'}
            onClick={() => setFilter('redeemed')}
            size="sm"
          >
            Redeemed
          </Button>
          <Button
            variant={filter === 'expired' ? 'default' : 'outline'}
            onClick={() => setFilter('expired')}
            size="sm"
          >
            Expired
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Redeemed By</TableHead>
              <TableHead>Redeemed Date</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.map((inv) => {
              const isRedeemed = inv._count.redemptions > 0
              const isExpired = inv.expiresAt && new Date(inv.expiresAt) < new Date()
              const redemption = inv.redemptions[0]

              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {inv.code}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCode(inv.code)}
                      >
                        {copiedCode === inv.code ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">{inv.campaign || 'N/A'}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary">{inv.segment}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    {isRedeemed ? (
                      <Badge className="bg-green-500">Redeemed</Badge>
                    ) : isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge className="bg-blue-500">Active</Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {redemption ? (
                      <div className="text-sm">
                        {redemption.user.firstName} {redemption.user.lastName}
                        <div className="text-xs text-muted-foreground">
                          {redemption.user.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {redemption ? (
                      <span className="text-sm">
                        {new Date(redemption.redeemedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {inv.expiresAt ? (
                      <span className="text-sm">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(inv.inviteLink)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredInvitations.length} of {invitations.length} invitations
      </div>
    </div>
  )
}