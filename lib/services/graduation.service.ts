// lib/services/graduation.service.ts
import { prisma } from '@/lib/prisma';
import { AccessTier, MarketStatus } from '@prisma/client';

interface GraduationCriteria {
  minDaysActive: number;
  minActionsCompleted: number;
  requireMarketActive: boolean;
}

const DEFAULT_CRITERIA: GraduationCriteria = {
  minDaysActive: 30,
  minActionsCompleted: 10,
  requireMarketActive: true
};

export class GraduationService {
  /**
   * Check if a single user is eligible for graduation from BETA to GENERAL
   * @param userId - Database user ID (NOT Clerk ID)
   */
  static async checkEligibility(
    userId: string,
    criteria: GraduationCriteria = DEFAULT_CRITERIA
  ): Promise<{ eligible: boolean; reasons: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accessTier: true,
        activatedAt: true,
        marketId: true,
      }
    });

    if (!user) {
      return { eligible: false, reasons: ['User not found'] };
    }

    if (user.accessTier !== AccessTier.BETA) {
      return { eligible: false, reasons: ['User is not in BETA tier'] };
    }

    const reasons: string[] = [];

    // Criteria 1: User has been active for minimum days
    if (user.activatedAt) {
      const daysSinceActivation = 
        (Date.now() - user.activatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceActivation < criteria.minDaysActive) {
        reasons.push(
          `User needs ${Math.ceil(criteria.minDaysActive - daysSinceActivation)} more active days`
        );
      }
    } else {
      reasons.push('User has not been activated yet');
    }

    // Criteria 2: Market is ACTIVE (if required and user has market)
    if (criteria.requireMarketActive && user.marketId) {
      const market = await prisma.market.findUnique({
        where: { id: user.marketId },
        select: { status: true, countryName: true }
      });

      if (market && market.status !== MarketStatus.ACTIVE) {
        reasons.push(`Market (${market.countryName}) is not in ACTIVE status`);
      }
    }

    // Criteria 3: User has completed minimum actions
    const activityCount = await this.getUserActivityCount(userId);
    if (activityCount < criteria.minActionsCompleted) {
      reasons.push(
        `User needs ${criteria.minActionsCompleted - activityCount} more completed actions`
      );
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Graduate a single user from BETA to GENERAL
   * @param userId - Database user ID
   */
  static async graduateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const eligibility = await this.checkEligibility(userId);
      
      if (!eligibility.eligible) {
        return {
          success: false,
          error: `User not eligible: ${eligibility.reasons.join(', ')}`
        };
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          accessTier: AccessTier.GENERAL,
          graduatedAt: new Date(),
          isBetaTester: false
        }
      });

      // TODO: Send graduation notification email
      // await sendGraduationEmail(userId);

      return { success: true };
    } catch (error) {
      console.error('Error graduating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find all eligible users for graduation
   */
  static async findEligibleUsers(
    criteria: GraduationCriteria = DEFAULT_CRITERIA
  ): Promise<string[]> {
    // Get all BETA users
    const betaUsers = await prisma.user.findMany({
      where: {
        accessTier: AccessTier.BETA,
        isActive: true
      },
      select: { id: true }
    });

    const eligible: string[] = [];

    for (const user of betaUsers) {
      const { eligible: isEligible } = await this.checkEligibility(
        user.id,
        criteria
      );
      
      if (isEligible) {
        eligible.push(user.id);
      }
    }

    return eligible;
  }

  /**
   * Graduate all eligible users (bulk operation)
   */
  static async graduateEligibleUsers(
    criteria: GraduationCriteria = DEFAULT_CRITERIA
  ): Promise<{ graduated: number; failed: number; errors: string[] }> {
    const eligibleUserIds = await this.findEligibleUsers(criteria);
    
    let graduated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of eligibleUserIds) {
      const result = await this.graduateUser(userId);
      
      if (result.success) {
        graduated++;
      } else {
        failed++;
        errors.push(`${userId}: ${result.error}`);
      }
    }

    console.log(`Graduation batch completed: ${graduated} graduated, ${failed} failed`);

    return { graduated, failed, errors };
  }

  /**
   * Get user's activity count
   * Counts user's tuitions as activity metric
   * @param userId - Database user ID
   */
  private static async getUserActivityCount(userId: string): Promise<number> {
    try {
      // Count user's tuitions
      const tuitionCount = await prisma.tuition.count({
        where: { userId }
      });

      return tuitionCount;
    } catch (error) {
      console.error('Error getting user activity count:', error);
      return 0;
    }
  }

  /**
   * Manual graduation (admin-triggered)
   * @param userId - Database user ID
   * @param adminId - Admin's Clerk ID or email
   * @param reason - Reason for manual graduation
   */
  static async manualGraduate(
    userId: string,
    adminId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          accessTier: true,
          metadata: true 
        }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.accessTier !== AccessTier.BETA) {
        return { success: false, error: 'User is not in BETA tier' };
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessTier: AccessTier.GENERAL,
          graduatedAt: new Date(),
          isBetaTester: false,
          metadata: {
            ...(user.metadata as object || {}),
            manualGraduation: {
              adminId,
              reason: reason || 'Manual graduation',
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      // TODO: Send graduation notification
      // await sendGraduationEmail(userId);

      return { success: true };
    } catch (error) {
      console.error('Error in manual graduation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upgrade user to PREMIUM tier
   * @param userId - Database user ID
   * @param adminId - Admin's ID (optional)
   */
  static async upgradeToPremium(
    userId: string,
    adminId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          metadata: true 
        }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessTier: AccessTier.PREMIUM,
          metadata: {
            ...(user.metadata as object || {}),
            premiumUpgrade: {
              adminId: adminId || 'system',
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get graduation statistics
   */
  static async getGraduationStats(): Promise<{
    totalBeta: number;
    eligible: number;
    graduated: number;
  }> {
    const totalBeta = await prisma.user.count({
      where: { accessTier: AccessTier.BETA }
    });

    const graduated = await prisma.user.count({
      where: {
        accessTier: AccessTier.GENERAL,
        graduatedAt: { not: null }
      }
    });

    const eligible = (await this.findEligibleUsers()).length;

    return { totalBeta, eligible, graduated };
  }
}
