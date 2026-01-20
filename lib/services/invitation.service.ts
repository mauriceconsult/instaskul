// lib/services/invitation.service.ts

import { PrismaClient, UserSegment, AccessTier, InvitationStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);

// Export types for use in API routes
export interface GenerateInvitationParams {
  marketId: string;
  segment: UserSegment;
  tier: AccessTier;
  count: number;
  maxUses: number;
  expiresAt?: Date;
  campaign?: string;
  notes?: string;
  createdBy?: string;
}

export interface InvitationDetails {
  code: string;
  inviteLink: string;
  expiresAt?: Date;
}

export interface ValidationResult {
  valid: boolean;
  invitation?: {
    market: {
      countryName: string;
      countryCode: string;
    };
    segment: UserSegment;
    tier: AccessTier;
    expiresAt?: Date;
    usesRemaining: number;
  };
  error?: string;
}

export interface RedemptionResult {
  success: boolean;
  user?: {
    id: string;
    market: string;
    segment: UserSegment;
    tier: AccessTier;
  };
  error?: string;
}

export class InvitationService {
  /**
   * Generate invitation codes
   */
  static async generateInvitations(
    params: GenerateInvitationParams
  ): Promise<InvitationDetails[]> {
    const invitations: InvitationDetails[] = [];

    for (let i = 0; i < params.count; i++) {
      // Generate code with market prefix
      const marketPrefix = params.marketId.slice(0, 2).toUpperCase();
      const code = `${marketPrefix}-${nanoid()}`;
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const inviteLink = `${baseUrl}/beta/join?code=${code}`;

      const invitation = await prisma.invitation.create({
        data: {
          code,
          inviteLink,
          marketId: params.marketId,
          segment: params.segment,
          tier: params.tier,
          maxUses: params.maxUses,
          expiresAt: params.expiresAt,
          campaign: params.campaign,
          notes: params.notes,
          createdBy: params.createdBy,
          status: InvitationStatus.ACTIVE
        }
      });

      invitations.push({
        code: invitation.code,
        inviteLink: invitation.inviteLink,
        expiresAt: invitation.expiresAt || undefined
      });
    }

    return invitations;
  }

  /**
   * Validate an invitation code
   */
  static async validateCode(code: string): Promise<ValidationResult> {
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: { market: true }
    });

    if (!invitation) {
      return { valid: false, error: 'Invalid invitation code' };
    }

    if (invitation.status !== InvitationStatus.ACTIVE) {
      return { 
        valid: false, 
        error: `Invitation is ${invitation.status.toLowerCase()}` 
      };
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED }
      });
      return { valid: false, error: 'Invitation has expired' };
    }

    if (invitation.maxUses !== -1 && invitation.currentUses >= invitation.maxUses) {
      return { 
        valid: false, 
        error: 'Invitation has reached maximum uses' 
      };
    }

    if (invitation.market.status === 'PLANNED') {
      return { 
        valid: false, 
        error: `${invitation.market.countryName} market is not yet available` 
      };
    }

    return {
      valid: true,
      invitation: {
        market: {
          countryName: invitation.market.countryName,
          countryCode: invitation.market.countryCode
        },
        segment: invitation.segment,
        tier: invitation.tier,
        expiresAt: invitation.expiresAt || undefined,
        usesRemaining: invitation.maxUses === -1 
          ? -1 
          : invitation.maxUses - invitation.currentUses
      }
    };
  }

  /**
   * Redeem an invitation code
   */
  static async redeemInvitation(
    code: string,
    clerkUserId: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<RedemptionResult> {
    // Validate the code first
    const validation = await this.validateCode(code);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: clerkUserId }
    });

    if (existingUser) {
      return { 
        success: false, 
        error: 'You already have beta access' 
      };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: { market: true }
    });

    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }

    try {
      // Create user record
      const user = await prisma.user.create({
        data: {
          id: clerkUserId,
          marketId: invitation.marketId,
          segment: invitation.segment,
          accessTier: invitation.tier,
          invitedAt: new Date(),
          isActive: true,
          isBetaTester: true,
          metadata: metadata || {}
        }
      });

      // Record redemption
      await prisma.invitationRedemption.create({
        data: {
          invitationId: invitation.id,
          userId: clerkUserId,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent
        }
      });

      // Increment usage count
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          currentUses: { increment: 1 }
        }
      });

      // Mark as used if single-use invitation
      if (invitation.maxUses === 1) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.USED }
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          market: invitation.market.countryName,
          segment: user.segment,
          tier: user.accessTier
        }
      };
    } catch (error) {
      console.error('Error redeeming invitation:', error);
      return { 
        success: false, 
        error: 'Failed to redeem invitation. Please try again.' 
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Get invitation statistics
   */
  static async getInvitationStats(code: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        market: true,
        redemptions: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            redemptions: true
          }
        }
      }
    });

    if (!invitation) {
      return null;
    }

    return {
      code: invitation.code,
      status: invitation.status,
      market: invitation.market.countryName,
      segment: invitation.segment,
      tier: invitation.tier,
      totalUses: invitation.currentUses,
      maxUses: invitation.maxUses,
      redemptions: invitation.redemptions.length,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      campaign: invitation.campaign
    };
  }

  /**
   * Revoke an invitation
   */
  static async revokeInvitation(code: string): Promise<boolean> {
    try {
      await prisma.invitation.update({
        where: { code },
        data: { status: InvitationStatus.REVOKED }
      });
      return true;
    } catch (error) {
      console.error('Error revoking invitation:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }
}