// app/dashboard/referral/page.tsx
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ReferralCard from '@/components/referral-card'

export default async function ReferralPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Get user's referral stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          referrals: true
        }
      }
    }
  })

  if (!user) {
    redirect('/sign-in')
  }

  // Generate or get user's referral code
  const referralCode = user.referralCode || user.id.slice(0, 8).toUpperCase()
  
  // Update user with referral code if they don't have one
  if (!user.referralCode) {
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode }
    })
  }

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/beta/join?ref=${referralCode}`
  const referralCount = user._count.referrals

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Invite Friends, Get Rewards</h1>
      <p className="text-muted-foreground mb-8">
        Share InstaSkul and earn benefits for every friend who joins
      </p>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-4xl mb-2">🎁</div>
          <h3 className="font-semibold mb-1">Free Premium</h3>
          <p className="text-sm text-muted-foreground">
            1 month free per successful referral
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-semibold mb-1">Lifetime Access</h3>
          <p className="text-sm text-muted-foreground">
            Top 10 referrers get lifetime premium
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="font-semibold mb-1">Special Badge</h3>
          <p className="text-sm text-muted-foreground">
            Unlock badges for 5+ referrals
          </p>
        </div>
      </div>

      <ReferralCard 
        referralLink={referralLink}
        referralCode={referralCode}
        referralCount={referralCount}
      />

      <div className="mt-8 bg-muted p-6 rounded-lg">
        <h2 className="font-semibold mb-3">Your Referral Stats</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Referrals:</span>
            <span className="font-semibold">{referralCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Premium Months Earned:</span>
            <span className="font-semibold">{referralCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold">
              {referralCount >= 10 ? '🏆 Top Referrer' : 
               referralCount >= 5 ? '⭐ Beta Champion' : 
               '👤 Beta User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}