// lib/services/invitation.service.ts

import { prisma } from '@/lib/prisma';
import { UserSegment, AccessTier, InvitationStatus } from '@prisma/client';
import { nanoid } from 'nanoid';

interface GenerateInvitationsParams {
  marketId: string;
  segment: UserSegment;
  tier: AccessTier;
  count: number;
  maxUses: number;
  expiresAt?: Date;
  campaign?: string;
  notes?: string;
  createdBy: string;
}

interface RedemptionMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export class InvitationService {
  /**
   * Generate multiple invitation codes
   */
  static async generateInvitations(params: GenerateInvitationsParams) {
    const {
      marketId,
      segment,
      tier,
      count,
      maxUses,
      expiresAt,
      campaign,
      notes,
      createdBy
    } = params;

    // Verify market exists
    const market = await prisma.market.findUnique({
      where: { id: marketId }
    });

    if (!market) {
      throw new Error('Market not found');
    }

    // Generate invitations
    const invitations = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateCode(segment);
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${code}`;

      const invitation = await prisma.invitation.create({
        data: {
          code,
          inviteLink,
          marketId,
          segment,
          tier,
          maxUses: maxUses === -1 ? 999999 : maxUses, // -1 means unlimited
          currentUses: 0,
          status: 'ACTIVE',
          expiresAt,
          campaign: campaign || 'admin_generated',
          notes,
          createdById: createdBy,
        },
        select: {
          code: true,
          inviteLink: true,
          expiresAt: true,
        }
      });

      invitations.push(invitation);
    }

    return invitations;
  }

  /**
   * Redeem an invitation code
   */
  static async redeemInvitation(
    code: string,
    userId: string,
    metadata?: RedemptionMetadata
  ) {
    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        market: true,
        redemptions: {
          where: { userId }
        }
      }
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Validate invitation
    const validationError = this.validateInvitation(invitation);
    if (validationError) {
      throw new Error(validationError);
    }

    // Check if user already redeemed
    if (invitation.redemptions.length > 0) {
      throw new Error('You have already used this invitation code');
    }

    // Redeem invitation
    const redemption = await prisma.$transaction(async (tx) => {
      // Create redemption record
      const redemption = await tx.invitationRedemption.create({
        data: {
          invitationId: invitation.id,
          userId,
          ipAddress: metadata?.ipAddress || null,
          userAgent: metadata?.userAgent || null,
        }
      });

      // Update invitation usage
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          currentUses: { increment: 1 },
          status: invitation.currentUses + 1 >= invitation.maxUses ? 'USED' : 'ACTIVE'
        }
      });

      // Update market beta user count (if the field exists in your schema)
      // await tx.market.update({
      //   where: { id: invitation.marketId },
      //   data: {
      //     currentBetaUsers: { increment: 1 }
      //   }
      // });

      return redemption;
    });

    return {
      success: true,
      redemption,
      market: invitation.market,
      segment: invitation.segment,
      tier: invitation.tier
    };
  }

  /**
   * Verify if an invitation code is valid
   */
  static async verifyInvitation(code: string, userId?: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        market: true,
        redemptions: userId ? {
          where: { userId }
        } : undefined
      }
    });

    if (!invitation) {
      return {
        valid: false,
        error: 'Invitation not found'
      };
    }

    const error = this.validateInvitation(invitation);
    if (error) {
      return {
        valid: false,
        error
      };
    }

    // Check if user already redeemed
    if (userId && invitation.redemptions && invitation.redemptions.length > 0) {
      return {
        valid: false,
        error: 'You have already used this invitation code'
      };
    }

    return {
      valid: true,
      invitation: {
        code: invitation.code,
        segment: invitation.segment,
        tier: invitation.tier,
        market: invitation.market,
        expiresAt: invitation.expiresAt
      }
    };
  }

  /**
   * List invitations with filters
   */
  static async listInvitations(filters?: {
    marketId?: string;
    status?: InvitationStatus;
    segment?: UserSegment;
    campaign?: string;
  }) {
    return prisma.invitation.findMany({
      where: {
        marketId: filters?.marketId,
        status: filters?.status,
        segment: filters?.segment,
        campaign: filters?.campaign,
      },
      include: {
        market: true,
        _count: {
          select: {
            redemptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get invitation statistics
   */
  static async getStats(marketId?: string) {
    const where = marketId ? { marketId } : {};

    const [total, active, used, expired] = await Promise.all([
      prisma.invitation.count({ where }),
      prisma.invitation.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.invitation.count({ where: { ...where, status: 'USED' } }),
      prisma.invitation.count({ where: { ...where, status: 'EXPIRED' } }),
    ]);

    const redemptions = await prisma.invitationRedemption.count({
      where: marketId ? {
        invitation: { marketId }
      } : undefined
    });

    return {
      total,
      active,
      used,
      expired,
      redemptions
    };
  }

  /**
   * Generate a unique invitation code
   */
  private static generateCode(segment: UserSegment): string {
    const prefix = 'BETA';
    const segmentCode = segment.substring(0, 3).toUpperCase();
    const random = nanoid(8).toUpperCase();
    return `${prefix}-${segmentCode}-${random}`;
  }

  /**
   * Validate invitation status
   */
  private static validateInvitation(invitation: any): string | null {
    // Check if already used up
    if (invitation.currentUses >= invitation.maxUses) {
      return 'This invitation code has been fully used';
    }

    // Check if expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return 'This invitation code has expired';
    }

    // Check if revoked
    if (invitation.status === 'REVOKED') {
      return 'This invitation code has been revoked';
    }

    // Check if inactive
    if (invitation.status !== 'ACTIVE') {
      return 'This invitation code is not active';
    }

    return null;
  }
}