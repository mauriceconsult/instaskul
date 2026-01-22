// /api/admin/invitations
import { UserSegment, AccessTier, MarketStatus, InvitationStatus } from '@prisma/client';

interface GenerateInvitationRequest {
  marketId: string;
  segment: UserSegment;
  tier: AccessTier;
  count: number; // How many codes to generate
  maxUses: number; // -1 for unlimited
  expiresAt?: Date;
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