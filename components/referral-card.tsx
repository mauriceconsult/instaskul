// components/referral-card.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Share2 } from 'lucide-react'

interface ReferralCardProps {
  referralLink: string
  referralCode: string
  referralCount: number
}

export default function ReferralCard({ 
  referralLink, 
  referralCode, 
  referralCount 
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join InstaSkul',
          text: 'Check out InstaSkul - a learning platform built for Africa! Use my referral code to get started.',
          url: referralLink
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Share this link with friends
          </label>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button 
              onClick={shareLink}
              variant="outline"
              size="icon"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Or use your referral code
          </label>
          <div className="flex items-center gap-2">
            <code className="bg-muted px-4 py-2 rounded text-lg font-bold tracking-wider">
              {referralCode}
            </code>
            <Button 
              onClick={async () => {
                await navigator.clipboard.writeText(referralCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              variant="ghost"
              size="sm"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">How to share:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>📱 Share on WhatsApp, Twitter, or Facebook</li>
            <li>📧 Send via email to friends and colleagues</li>
            <li>💬 Post in student/teacher groups</li>
            <li>🎓 Share with your school community</li>
          </ul>
        </div>

        {referralCount > 0 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-4 text-center">
            <p className="font-semibold text-green-700 dark:text-green-300">
              🎉 You've referred {referralCount} {referralCount === 1 ? 'person' : 'people'}!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Keep sharing to unlock more rewards
            </p>
          </div>
        )}
      </div>
    </div>
  )
}