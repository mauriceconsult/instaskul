// app/api/admin/markets/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MarketStatus, UserSegment } from '@prisma/client'
import { requireAdminAccess } from '@/lib/beta-helpers'

interface CreateMarketRequest {
  countryCode: string
  countryName: string
  region?: string
  status: MarketStatus
  allowedSegments: UserSegment[]
  maxBetaUsers?: number
  paymentMethods: string[]
  currency: string
  pricingConfig?: Record<string, any>
  featureFlags?: Record<string, boolean>
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAccess()
    if ('error' in auth) return auth.error

    const body: CreateMarketRequest = await req.json()
    const {
      countryCode,
      countryName,
      region,
      status,
      allowedSegments,
      maxBetaUsers,
      paymentMethods,
      currency,
      pricingConfig,
      featureFlags
    } = body

    // Validate required fields
    if (!countryCode || !countryName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if market already exists
    const existing = await prisma.market.findUnique({
      where: { countryCode }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Market with this country code already exists' },
        { status: 409 }
      )
    }

    // Create market
    const market = await prisma.market.create({
      data: {
        countryCode,
        countryName,
        region,
        status,
        allowedSegments,
        maxBetaUsers,
        paymentMethods,
        currency,
        pricingConfig,
        featureFlags
      }
    })

    return NextResponse.json({ success: true, market })
  } catch (error) {
    console.error('[ADMIN_MARKETS_CREATE]', error)
    return NextResponse.json(
      { error: 'Failed to create market' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAccess()
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const markets = await prisma.market.findMany({
      where: {
        ...(status && { status: status as MarketStatus })
      },
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        countryName: 'asc'
      }
    })

    return NextResponse.json({ markets })
  } catch (error) {
    console.error('[ADMIN_MARKETS_LIST]', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminAccess()
    if ('error' in auth) return auth.error

    const { marketId, ...updates } = await req.json()

    if (!marketId) {
      return NextResponse.json(
        { error: 'Market ID is required' },
        { status: 400 }
      )
    }

    const market = await prisma.market.update({
      where: { id: marketId },
      data: updates
    })

    return NextResponse.json({ success: true, market })
  } catch (error) {
    console.error('[ADMIN_MARKETS_UPDATE]', error)
    return NextResponse.json(
      { error: 'Failed to update market' },
      { status: 500 }
    )
  }
}