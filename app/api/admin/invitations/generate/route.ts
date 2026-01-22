// app/api/admin/invitations/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserSegment, AccessTier } from '@prisma/client';
import { InvitationService } from '@/lib/services/invitation.service';

// Type definitions
interface GenerateInvitationRequest {
  marketId: string;
  segment: UserSegment;
  tier: AccessTier;
  count: number;
  maxUses: number; // -1 for unlimited
  expiresAt?: string; // ISO date string
  campaign?: string;
  notes?: string;
}

interface GenerateInvitationResponse {
  invitations: Array<{
    code: string;
    inviteLink: string;
    expiresAt?: Date;
  }>;
}

// Helper to check admin access
async function isAdmin(userId: string): Promise<boolean> {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateInvitationRequest = await req.json();

    // Validate required fields
    if (!body.marketId || !body.segment || !body.tier || !body.count) {
      return NextResponse.json(
        { error: 'Missing required fields: marketId, segment, tier, count' },
        { status: 400 }
      );
    }

    if (body.count < 1 || body.count > 1000) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Convert expiresAt string to Date if provided
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;

    const invitations = await InvitationService.generateInvitations({
      marketId: body.marketId,
      segment: body.segment,
      tier: body.tier,
      count: body.count,
      maxUses: body.maxUses,
      expiresAt,
      campaign: body.campaign,
      notes: body.notes,
      createdBy: userId
    });

    const response: GenerateInvitationResponse = {
      invitations: invitations.map(inv => ({
        code: inv.code,
        inviteLink: inv.inviteLink,
        ...(inv.expiresAt && { expiresAt: inv.expiresAt })
      }))
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error generating invitations:', error);
    return NextResponse.json(
      { error: 'Failed to generate invitations' },
      { status: 500 }
    );
  }
}