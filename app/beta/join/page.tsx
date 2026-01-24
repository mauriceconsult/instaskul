// app/beta/join/page.tsx
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InstaSkulLogo } from '@/components/instaskul-logo'
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      {/* Large logo at top */}
      <div className="mb-8">
        <InstaSkulLogo size="lg" />
      </div>

      {/* Form */}
      <BetaJoinForm 
        inviteCode={inviteCode} 
        referralCode={referralCode}
      />

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>© 2026 InstaSkul. Built in Uganda for Africa.</p>
        <div className="flex gap-4 justify-center mt-2">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/about" className="hover:underline">About</a>
        </div>
      </footer>
    </div>
  )
}