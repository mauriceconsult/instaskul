// app/admin/layout.tsx
import AdminHeader from '@/components/admin-header'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Check admin access
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  if (!adminIds.includes(userId)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}