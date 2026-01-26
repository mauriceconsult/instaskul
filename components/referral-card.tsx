// components/referral-card.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check, Share2, Link as LinkIcon } from 'lucide-react'
import { getBetaJoinUrl } from '@/lib/url' // ADD THIS

interface ReferralCardProps {
  referralLink: string
  referralCode: string
  referralCount: number
  premiumMonthsEarned: number
}

export default function ReferralCard({ 
  referralCode, 
  referralCount,
  premiumMonthsEarned 
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  
  const referralUrl = getBetaJoinUrl(undefined, referralCode) // CHANGED

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join InstaSkul Beta',
          text: 'Check out InstaSkul - education platform built for African classrooms!',
          url: referralUrl
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      copyToClipboard(referralUrl)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
        <CardDescription>
          Share InstaSkul and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link */}
        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-muted rounded border font-mono text-sm overflow-x-auto whitespace-nowrap">
            {referralUrl}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(referralUrl)}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Referral Code */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Or share your code:</p>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded border font-mono text-lg text-center font-bold">
              {referralCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralCode)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
            <p className="text-2xl font-bold">{referralCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Months Earned</p>
            <p className="text-2xl font-bold text-primary">{premiumMonthsEarned}</p>
          </div>
        </div>

        {/* Share Button */}
        <Button onClick={shareReferral} className="w-full" size="lg">
          <Share2 className="mr-2 h-4 w-4" />
          Share Referral Link
        </Button>

        {/* Instructions */}
        <div className="bg-muted p-4 rounded text-sm space-y-2">
          <p className="font-semibold">How to share:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Copy the link and share via WhatsApp, email, or social media</li>
            <li>Or share your code directly with friends</li>
            <li>They use your link/code when joining</li>
            <li>You both get rewards!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}