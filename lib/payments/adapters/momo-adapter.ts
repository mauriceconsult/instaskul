import { PaymentAdapter } from './base-adapter'
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  PaymentVerification,
} from '@/lib/types/payment.types'

interface MomoCredentials {
  primaryKey: string;   // Ocp-Apim-Subscription-Key
  userId: string;       // Basic Auth username
  userSecret: string;   // Basic Auth password
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;    // epoch ms
}

export class MobileMoneyAdapter extends PaymentAdapter {
  name = 'Mobile Money (Uganda)'
  supportedNetworks = ['MTN', 'AIRTEL']

  private baseUrl: string;
  private collections: MomoCredentials;
  private disbursements: MomoCredentials;

  // Separate token caches — Collections and Disbursements are independent
  // OAuth sessions and must never share a bearer token.
  private collectionsToken: CachedToken | null = null;
  private disbursementsToken: CachedToken | null = null;

  constructor() {
    super();

    this.baseUrl = process.env.MOMO_TARGET_ENVIRONMENT || "";

    this.collections = {
      primaryKey: process.env.MOMO_PRIMARY_KEY    || "",
      userId:     process.env.MOMOUSER_ID         || "",
      userSecret: process.env.MOMOUSER_SECRET     || "",
    };

    this.disbursements = {
      primaryKey: process.env.MOMO_PRIMARY_KEY_DISBURSEMENTS || "",
      userId:     process.env.MOMO_DISBURSE_USER_ID          || "",
      userSecret: process.env.MOMO_DISBURSE_USER_SECRET      || "",
    };

    this.assertCredentials("Collections", this.collections);
    this.assertCredentials("Disbursements", this.disbursements);
  }

  private assertCredentials(label: string, creds: MomoCredentials) {
    if (!creds.primaryKey || !creds.userId || !creds.userSecret) {
      console.warn(
        `[MOMO_ADAPTER] Missing ${label} env vars — ` +
        `${label} calls will fail until they are set.`
      );
    }
  }

  protected formatPhoneNumber(phone: string, network: string): string {
    let cleaned = phone.replace(/\D/g, '')
    if (!cleaned.startsWith('256')) {
      cleaned = cleaned.startsWith('0') ? '256' + cleaned.slice(1) : '256' + cleaned
    }
    return cleaned
  }

  // ── OAuth token exchange — separate per product ─────────────────────────────

  private async getToken(
    product: "collection" | "disbursement",
    creds: MomoCredentials,
    cache: CachedToken | null,
  ): Promise<{ token: string; cache: CachedToken }> {
    // Reuse cached token if it has > 60s of life left
    if (cache && cache.expiresAt > Date.now() + 60_000) {
      return { token: cache.accessToken, cache };
    }

    const basicAuth = Buffer.from(`${creds.userId}:${creds.userSecret}`).toString("base64");

    const res = await fetch(`${this.baseUrl}/${product}/token/`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Ocp-Apim-Subscription-Key": creds.primaryKey,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `MoMo ${product} token request failed: ${data.message ?? res.status}`
      );
    }

    const newCache: CachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };

    return { token: data.access_token, cache: newCache };
  }

  // ── Collections ────────────────────────────────────────────────────────────

  async initiateCollection(request: PaymentRequest): Promise<PaymentResponse> {
    const amount = this.normalizeAmount(request.amount.value)
    const phone = this.formatPhoneNumber(request.phoneNumber, request.network)

    try {
      const { token, cache } = await this.getToken(
        "collection", this.collections, this.collectionsToken
      );
      this.collectionsToken = cache;

      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': request.reference,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': this.collections.primaryKey,
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: request.amount.currency,
          externalId: request.reference,
          payer: { partyIdType: 'MSISDN', partyId: phone },
          payerMessage: request.description ?? 'Payment',
          payeeNote: request.description ?? 'Payment',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Collection request failed: ${response.status}`)
      }

      return {
        success: true,
        transactionId: request.reference,   // RequestToPay has no body — ref IS the ID
        reference: request.reference,
        status: 'PROCESSING',
        amount: { value: amount, currency: request.amount.currency },
        network: request.network,
        message: 'Payment request sent. Please check your phone.',
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        reference: request.reference,
        status: 'FAILED',
        amount: request.amount,
        network: request.network,
        message: error.message || 'Payment failed',
      }
    }
  }

  // ── Disbursements ────────────────────────────────────────────────────────────

  async initiateDisbursement(request: PaymentRequest): Promise<PaymentResponse> {
    const amount = this.normalizeAmount(request.amount.value)
    const phone = this.formatPhoneNumber(request.phoneNumber, request.network)

    try {
      const { token, cache } = await this.getToken(
        "disbursement", this.disbursements, this.disbursementsToken
      );
      this.disbursementsToken = cache;

      const response = await fetch(`${this.baseUrl}/disbursement/v1_0/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': request.reference,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': this.disbursements.primaryKey,
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: request.amount.currency,
          externalId: request.reference,
          payee: { partyIdType: 'MSISDN', partyId: phone },
          payerMessage: request.description ?? 'Payout',
          payeeNote: request.description ?? 'Payout',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Disbursement failed: ${response.status}`)
      }

      return {
        success: true,
        transactionId: request.reference,
        reference: request.reference,
        status: 'PROCESSING',
        amount: { value: amount, currency: request.amount.currency },
        network: request.network,
        message: 'Disbursement initiated successfully',
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        reference: request.reference,
        status: 'FAILED',
        amount: request.amount,
        network: request.network,
        message: error.message || 'Disbursement failed',
      }
    }
  }

  // ── Verification ────────────────────────────────────────────────────────────
  // Must know WHICH product (Collections vs Disbursements) a reference belongs
  // to, since each has its own GET status endpoint and credentials.

  async verifyPayment(
    reference: string,
    product: "collection" | "disbursement" = "collection",
  ): Promise<PaymentVerification> {
    try {
      const creds = product === "collection" ? this.collections : this.disbursements;
      const cacheRef = product === "collection" ? this.collectionsToken : this.disbursementsToken;
      const { token, cache } = await this.getToken(product, creds, cacheRef);
      if (product === "collection") this.collectionsToken = cache;
      else this.disbursementsToken = cache;

      const path = product === "collection" ? "requesttopay" : "transfer";
      const response = await fetch(
        `${this.baseUrl}/${product}/v1_0/${path}/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': creds.primaryKey,
          },
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      const amount = this.normalizeAmount(data.amount)

      return {
        reference,
        status: data.status as PaymentStatus,
        transactionId: reference,
        receiptNumber: data.financialTransactionId,
        amount: { value: amount, currency: data.currency },
        completedAt: data.status === 'SUCCESSFUL' ? new Date() : undefined,
        failureReason: data.reason,
      }
    } catch (error: any) {
      return {
        reference,
        status: 'FAILED',
        failureReason: error.message,
      }
    }
  }
}