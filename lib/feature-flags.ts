// lib/feature-flags.ts

import { prisma } from "./db";

export async function checkFeature(
  userId: string,
  featureName: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { market: true }
  });
  
  if (!user) return false;
  
  // Check market-level flag
  const marketFlags = user.market.featureFlags as Record<string, boolean>;
  if (marketFlags[featureName] !== undefined) {
    return marketFlags[featureName];
  }
  
  // Check tier-level defaults
  const tierDefaults = {
    ALPHA: ['all_features'],
    BETA: ['core_features', 'beta_features'],
    GA: ['core_features']
  };
  
  return tierDefaults[user.accessTier]?.includes(featureName) || false;
}

// Usage in components:
// const userId = "user-id-here"; // Replace with actual userId
// const canUseAdvancedAnalytics = await checkFeature(userId, 'advancedAnalytics');