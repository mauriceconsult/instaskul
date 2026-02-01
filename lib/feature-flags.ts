// lib/feature-flags.ts
// Feature flags system - CORRECTED for your User model

import { prisma } from "@/lib/prisma";
import { AccessTier } from "@prisma/client";

// Define your feature flags
export enum Feature {
  BLOG = "blog",
  ADVANCED_ANALYTICS = "advanced_analytics",
  MULTI_CURRENCY = "multi_currency",
  MPESA_PAYMENTS = "mpesa_payments",
  BULK_UPLOAD = "bulk_upload",
  AI_ASSISTANT = "ai_assistant",
  BETA_FEATURES = "beta_features",
  ADMIN_PANEL = "admin_panel",
}

// Feature configuration: which tiers have access to which features
const FEATURE_ACCESS: Record<Feature, AccessTier[]> = {
  [Feature.BLOG]: [AccessTier.PREMIUM, AccessTier.ALPHA],
  [Feature.ADVANCED_ANALYTICS]: [AccessTier.PREMIUM, AccessTier.ALPHA],
  [Feature.MULTI_CURRENCY]: [AccessTier.BETA, AccessTier.GENERAL, AccessTier.PREMIUM, AccessTier.ALPHA],
  [Feature.MPESA_PAYMENTS]: [AccessTier.BETA, AccessTier.GENERAL, AccessTier.PREMIUM, AccessTier.ALPHA],
  [Feature.BULK_UPLOAD]: [AccessTier.PREMIUM, AccessTier.ALPHA],
  [Feature.AI_ASSISTANT]: [AccessTier.PREMIUM, AccessTier.ALPHA],
  [Feature.BETA_FEATURES]: [AccessTier.BETA, AccessTier.ALPHA],
  [Feature.ADMIN_PANEL]: [AccessTier.ALPHA],
};

/**
 * Check if a user has access to a specific feature
 * @param userId - User ID (NOT Clerk ID - use the database user.id)
 * @param featureName - Feature to check (can be Feature enum or string)
 */
export async function checkFeature(
  userId: string,
  featureName: Feature | string
): Promise<boolean> {
  try {
    // Find user in database by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        accessTier: true,
        marketId: true,
      }
    });

    if (!user) {
      return false;
    }

    // Check if feature exists in FEATURE_ACCESS
    const feature = featureName as Feature;
    const allowedTiers = FEATURE_ACCESS[feature];

    if (!allowedTiers) {
      // Feature not defined - default to deny
      return false;
    }

    // Check if user's tier has access
    if (!allowedTiers.includes(user.accessTier)) {
      return false;
    }

    // Optional: Check market-level feature flags if user has a market
    if (user.marketId) {
      const market = await prisma.market.findUnique({
        where: { id: user.marketId },
        select: { featureFlags: true }
      });

      if (market?.featureFlags) {
        const marketFlags = market.featureFlags as Record<string, boolean>;
        if (marketFlags[featureName] !== undefined) {
          return marketFlags[featureName];
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

/**
 * Check feature for authenticated Clerk user
 * @param clerkUserId - Clerk user ID from auth()
 * @param feature - Feature to check
 */
export async function checkFeatureForClerkUser(
  clerkUserId: string,
  feature: Feature
): Promise<boolean> {
  try {
    // First check if admin
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (adminIds.includes(clerkUserId)) {
      return true; // Admins have access to everything
    }

    // TODO: Link Clerk users to database users
    // For now, admins-only access
    // You need to add logic to map Clerk ID to your User.id
    // Options:
    // 1. Store Clerk user email and match: { email: clerkUserEmail }
    // 2. Add clerkId field to User model and match: { clerkId: clerkUserId }
    // 3. Store in metadata: { metadata: { path: ['clerkId'], equals: clerkUserId } }
    
    return false;
  } catch (error) {
    console.error("Error checking feature for Clerk user:", error);
    return false;
  }
}

/**
 * Get user's access tier
 * @param userId - Database user ID
 */
export async function getUserTier(userId: string): Promise<AccessTier | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessTier: true }
    });

    return user?.accessTier || null;
  } catch (error) {
    console.error("Error getting user tier:", error);
    return null;
  }
}

/**
 * Get all features available to a user
 * @param userId - Database user ID
 */
export async function getAvailableFeatures(userId: string): Promise<Feature[]> {
  try {
    const userTier = await getUserTier(userId);
    
    if (!userTier) {
      return [];
    }

    return Object.entries(FEATURE_ACCESS)
      .filter(([_, allowedTiers]) => allowedTiers.includes(userTier))
      .map(([feature]) => feature as Feature);
  } catch (error) {
    console.error("Error getting available features:", error);
    return [];
  }
}

/**
 * Check if user has access based on tier
 * @param userTier - User's access tier
 * @param requiredTiers - Required tiers for access
 */
export function hasTierAccess(
  userTier: AccessTier,
  requiredTiers: AccessTier[]
): boolean {
  return requiredTiers.includes(userTier);
}

/**
 * Require a feature or throw error
 * Use in Server Components/API routes
 * @param userId - Database user ID
 * @param feature - Required feature
 */
export async function requireFeature(
  userId: string,
  feature: Feature
): Promise<void> {
  const hasAccess = await checkFeature(userId, feature);
  
  if (!hasAccess) {
    throw new Error(`Access denied: ${feature} feature not available for user`);
  }
}

/**
 * Tier hierarchy for upgrade logic
 */
export const TIER_HIERARCHY: Record<AccessTier, number> = {
  [AccessTier.GENERAL]: 0,
  [AccessTier.BETA]: 1,
  [AccessTier.PREMIUM]: 2,
  [AccessTier.ALPHA]: 3,
};

/**
 * Check if user can be upgraded to a tier
 */
export function canUpgradeTo(currentTier: AccessTier, targetTier: AccessTier): boolean {
  return TIER_HIERARCHY[targetTier] > TIER_HIERARCHY[currentTier];
}

/**
 * Helper: Get database user ID from Clerk user ID
 * Currently only works for admins - needs Clerk-to-User mapping
 */
export async function getDbUserIdFromClerk(clerkUserId: string): Promise<string | null> {
  try {
    // Check if admin first
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (adminIds.includes(clerkUserId)) {
      // For admins, bypass user lookup
      return null; // Handle admin access separately
    }

    // TODO: Implement Clerk to User mapping
    // Option 1: Store Clerk user email and match
    // const clerkUser = await currentUser();
    // const user = await prisma.user.findUnique({
    //   where: { email: clerkUser?.emailAddresses[0]?.emailAddress }
    // });
    
    // Option 2: Add clerkId field to User model
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: clerkUserId }
    // });

    return null;
  } catch (error) {
    console.error("Error getting DB user from Clerk ID:", error);
    return null;
  }
}
