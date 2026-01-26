// app/(server)/dashboard/referral/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReferralCard from '@/components/referral-card'

export default async function ReferralPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get user with referral data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      premiumMonthsEarned: true,
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

  // Handle null referralCode - generate one if missing
  let referralCode = user.referralCode
  
  if (!referralCode) {
    // Generate a new referral code if user doesn't have one
    referralCode = `REF-${userId.slice(0, 8).toUpperCase()}`
    
    // Update user with new referral code
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode }
    })
  }

  // Build referral link
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/beta/join?ref=${referralCode}`
  
  const referralCount = user._count.referrals
  const premiumMonthsEarned = user.premiumMonthsEarned || 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Invite Friends, Get Rewards</h1>
        <p className="text-muted-foreground">
          Share InstaSkul and earn benefits for every friend who joins
        </p>
      </div>

      <ReferralCard
        referralLink={referralLink}
        referralCode={referralCode}
        referralCount={referralCount}
        premiumMonthsEarned={premiumMonthsEarned}
      />

      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">1.</span>
            <span>Share your unique referral link with friends</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">2.</span>
            <span>When they sign up using your link, you both get rewards</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">3.</span>
            <span>Earn 1 month of premium for every 5 successful referrals</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">4.</span>
            <span>Your friend gets instant beta access</span>
          </li>
        </ol>
      </div>
    </div>
  )
}