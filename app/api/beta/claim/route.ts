// app/api/beta/claim/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { InvitationService } from "@/lib/services/invitation.service"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { code } = await req.json()

    if (!code) {
      return NextResponse.json(
        { error: "Invitation code is required" },
        { status: 400 }
      )
    }

    const result = await InvitationService.redeemInvitation(
      code.toUpperCase(),
      userId,
      {
        ipAddress: req.ip,
        userAgent: req.headers.get('user-agent') || undefined
      }
    )

    return NextResponse.json({
      success: true,
      segment: result.segment,
      tier: result.tier,
      market: result.market,
      message: "Beta access granted!",
    })
  } catch (error: any) {
    console.error("[BETA_CLAIM]", error)
    return NextResponse.json(
      { error: error.message || "Failed to claim invitation" },
      { status: 400 }
    )
  }
}