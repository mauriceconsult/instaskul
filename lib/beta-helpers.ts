// lib/beta-helpers.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { MarketStatus } from '@prisma/client'

export async function requireBetaAccess() {
  const { userId } = await auth()
  
  if (!userId) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { market: true }
  })

  if (!user) {
    return { 
      error: NextResponse.json({ error: 'User not found' }, { status: 404 }) 
    }
  }

  if (!user.isActive) {
    return { 
      error: NextResponse.json({ error: 'Account inactive' }, { status: 403 }) 
    }
  }

  if (user.market.status === MarketStatus.PLANNED) {
    return { 
      error: NextResponse.json({ 
        error: 'Market not available',
        message: `${user.market.countryName} market is not yet launched` 
      }, { status: 403 }) 
    }
  }

  if (user.market.status === MarketStatus.SUNSET) {
    return { 
      error: NextResponse.json({ 
        error: 'Market sunset',
        message: `${user.market.countryName} market is no longer supported` 
      }, { status: 403 }) 
    }
  }

  return { user, userId }
}

export async function requireAdminAccess() {
  const { userId } = await auth()
  
  if (!userId) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    }
  }

  // Check if user is admin
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  
  if (!adminIds.includes(userId)) {
    return { 
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) 
    }
  }

  return { userId }
}

export async function checkBetaAccess(userId: string): Promise<{
  hasAccess: boolean
  reason?: string
  user?: any
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { market: true }
    })

    if (!user) {
      return { 
        hasAccess: false, 
        reason: 'No beta access - invitation required' 
      }
    }

    if (!user.isActive) {
      return { 
        hasAccess: false, 
        reason: 'Account is inactive' 
      }
    }

    const marketStatus = user.market.status
    
    if (marketStatus === MarketStatus.PLANNED) {
      return { 
        hasAccess: false, 
        reason: `${user.market.countryName} market is not yet available` 
      }
    }

    if (marketStatus === MarketStatus.SUNSET) {
      return { 
        hasAccess: false, 
        reason: `${user.market.countryName} market is no longer supported` 
      }
    }

    return { hasAccess: true, user }
  } catch (error) {
    console.error('Error checking beta access:', error)
    return { 
      hasAccess: false, 
      reason: 'Error validating access' 
    }
  }
}