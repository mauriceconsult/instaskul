// lib/auth-helpers.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function checkBetaAccess() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { market: true }
  })

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'No beta access' }, { status: 403 })
  }

  return { user }
}