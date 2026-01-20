// /api/admin/markets
// Add this import to ANY file that uses these types
import { UserSegment, AccessTier, MarketStatus, InvitationStatus } from '@prisma/client';

interface CreateMarketRequest {
  countryCode: string;
  countryName: string;
  region?: string;
  status: MarketStatus;
  allowedSegments: UserSegment[];
  maxBetaUsers?: number;
  paymentMethods: string[];
  currency: string;
  pricingConfig?: Record<string, any>;
  featureFlags?: Record<string, boolean>;
}