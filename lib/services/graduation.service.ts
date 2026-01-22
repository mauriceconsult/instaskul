// lib/services/graduation.service.ts
import { prisma } from '@/lib/prisma'

import { AccessTier, MarketStatus } from '@prisma/client';

interface GraduationCriteria {
  minDaysActive: number;
  minActionsCompleted: number;
  requireMarketGA: boolean;
}

const DEFAULT_CRITERIA: GraduationCriteria = {
  minDaysActive: 30,
  minActionsCompleted: 10, // Adjust based on your product
  requireMarketGA: true
};

export class GraduationService {
  /**
   * Check if a single user is eligible for graduation from BETA to GA
   */
  static async checkEligibility(
    userId: string,
    criteria: GraduationCriteria = DEFAULT_CRITERIA
  ): Promise<{ eligible: boolean; reasons: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { market: true }
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

    // Criteria 2: Market is in GA status (if required)
    if (criteria.requireMarketGA && user.market.status !== MarketStatus.GA) {
      reasons.push(`Market (${user.market.countryName}) is not in GA status`);
    }

    // Criteria 3: User has completed minimum actions
    // TODO: Replace with your actual activity tracking
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
   * Graduate a single user from BETA to GA
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
          accessTier: AccessTier.GA,
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
      include: { market: true }
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
   * TODO: Replace with your actual activity tracking logic
   */
  private static async getUserActivityCount(userId: string): Promise<number> {
    // Example: Count actions from your activity/events table
    // const count = await prisma.userActivity.count({
    //   where: { userId }
    // });
    // return count;

    // Placeholder - replace with real implementation
    return 15; // Assume users have completed 15 actions
  }

  /**
   * Manual graduation (admin-triggered)
   */
  static async manualGraduate(
    userId: string,
    adminId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.accessTier !== AccessTier.BETA) {
        return { success: false, error: 'User is not in BETA tier' };
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          accessTier: AccessTier.GA,
          graduatedAt: new Date(),
          isBetaTester: false,
          metadata: {
            ...(user.metadata as object),
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
}