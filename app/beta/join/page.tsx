// app/beta/join/page.tsx
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BetaJoinForm from '@/components/beta-join-form'

export default async function BetaJoinPage({
  searchParams
}: {
  searchParams: { code?: string; ref?: string }
}) {
  const { userId } = await auth()
  const inviteCode = searchParams.code
  const referralCode = searchParams.ref

  // If user is already logged in, check if they already have beta access
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user already has beta access, redirect to dashboard
    if (user?.isActive) {
      redirect('/dashboard')
    }

    // Track referral if present
    if (referralCode && user && !user.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (referrer) {
        await prisma.user.update({
          where: { id: userId },
          data: { referredBy: referrer.id }
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <BetaJoinForm 
        inviteCode={inviteCode} 
        referralCode={referralCode}
      />
    </div>
  )
}