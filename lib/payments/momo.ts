export interface MoMoWebhookPayload {
  referenceId: string;
  status: "SUCCESSFUL" | "FAILED" | "PENDING" | "CANCELLED";

  financialTransactionId?: string;

  amount?: string;

  currency?: string;

  externalId?: string;
}