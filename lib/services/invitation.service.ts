// lib/services/invitation.service.ts
import { prisma } from '@/lib/prisma'
import { getBetaJoinUrl } from '@/lib/url'
import type { UserSegment, AccessTier, InvitationStatus } from '@prisma/client'

export class InvitationService {
  static async generateInvitation({
    marketId,
    segment,
    tier,
    campaign,
    notes,
    createdById,
    maxUses = 1,
    expiresAt
  }: {
    marketId: string
    segment: UserSegment
    tier: AccessTier
    campaign?: string
    notes?: string
    createdById: string
    maxUses?: number
    expiresAt?: Date
  }) {
    // Generate unique code
    const code = this.generateCode()
    
    // Generate invite link using utility
    const inviteLink = getBetaJoinUrl(code)

    return await prisma.invitation.create({
      data: {
        code,
        inviteLink,
        marketId,
        segment,
        tier,
        campaign,
        notes,
        createdById,
        maxUses,
        status: 'ACTIVE' as InvitationStatus,
        expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    })
  }

  // FIXED: Removed the extra p0 parameter
  static async verifyInvitation(code: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        market: true,
        redemptions: true
      }
    })

    if (!invitation) {
      return {
        valid: false,
        message: 'Invalid invitation code'
      }
    }

    if (invitation.status !== 'ACTIVE') {
      return {
        valid: false,
        message: 'This invitation is no longer active'
      }
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return {
        valid: false,
        message: 'This invitation has expired'
      }
    }

    if (invitation.redemptions.length >= invitation.maxUses) {
      return {
        valid: false,
        message: 'This invitation has been fully used'
      }
    }

    return {
      valid: true,
      message: 'Invitation is valid',
      invitation
    }
  }

  static async redeemInvitation({
    code,
    userId,
    referralCode
  }: {
    code: string
    userId: string
    referralCode?: string
  }) {
    // Verify invitation
    const verification = await this.verifyInvitation(code)

    if (!verification.valid || !verification.invitation) {
      throw new Error(verification.message)
    }

    const invitation = verification.invitation

    // Check if user already redeemed this code
    const existingRedemption = await prisma.invitationRedemption.findFirst({
      where: {
        invitationId: invitation.id,
        userId
      }
    })

    if (existingRedemption) {
      throw new Error('You have already redeemed this invitation')
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create redemption
      const redemption = await tx.invitationRedemption.create({
        data: {
          invitationId: invitation.id,
          userId
        }
      })

      // Update user beta access
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          marketId: invitation.marketId,
          segment: invitation.segment,
          accessTier: invitation.tier,
          activatedAt: new Date()
        }
      })

      // Handle referral if provided
      if (referralCode) {
        const referrer = await tx.user.findUnique({
          where: { referralCode }
        })

        if (referrer && referrer.id !== userId) {
          await tx.user.update({
            where: { id: userId },
            data: { referredBy: referrer.id }
          })
        }
      }

      return redemption
    })

    return {
      success: true,
      redemption: result
    }
  }

  private static generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const segments = 3
    const segmentLength = 4
    
    const code = Array(segments)
      .fill(null)
      .map(() => {
        return Array(segmentLength)
          .fill(null)
          .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
          .join('')
      })
      .join('-')
    
    return code
  }

  /**
   * Get invitation statistics
   */
  static async getInvitationStats(invitationId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        redemptions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true
              }
            }
          }
        },
        _count: {
          select: {
            redemptions: true
          }
        }
      }
    })

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    return {
      code: invitation.code,
      status: invitation.status,
      campaign: invitation.campaign,
      totalRedemptions: invitation._count.redemptions,
      maxUses: invitation.maxUses,
      remainingUses: invitation.maxUses - invitation._count.redemptions,
      expiresAt: invitation.expiresAt,
      isExpired: invitation.expiresAt ? new Date() > invitation.expiresAt : false,
      redemptions: invitation.redemptions
    }
  }

  /**
   * Bulk generate invitations
   */
  static async bulkGenerate({
    count,
    marketId,
    segment,
    tier,
    campaign,
    createdById,
    maxUses = 1,
    expiresAt
  }: {
    count: number
    marketId: string
    segment: UserSegment
    tier: AccessTier
    campaign?: string
    createdById: string
    maxUses?: number
    expiresAt?: Date
  }) {
    const invitations = []

    for (let i = 0; i < count; i++) {
      const invitation = await this.generateInvitation({
        marketId,
        segment,
        tier,
        campaign,
        notes: campaign ? `Bulk generated for ${campaign}` : 'Bulk generated',
        createdById,
        maxUses,
        expiresAt
      })

      invitations.push(invitation)
    }

    return invitations
  }

  /**
   * Deactivate invitation
   */
  static async deactivateInvitation(code: string, reason?: string) {
    return await prisma.invitation.update({
      where: { code },
      data: {
        status: 'DISABLED' as InvitationStatus,
        notes: reason ? `Disabled: ${reason}` : 'Disabled'
      }
    })
  }

  /**
   * Get user's invitation redemption history
   */
  static async getUserRedemptions(userId: string) {
    return await prisma.invitationRedemption.findMany({
      where: { userId },
      include: {
        invitation: {
          include: {
            market: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}