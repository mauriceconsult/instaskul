import { DARAJA_BASE, mpesaConfig } from "./config";

let cached: { token: string; exp: number } | null = null;

export class DarajaResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DarajaResponseError";
  }
}

export async function getAccessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;

  const { consumerKey, consumerSecret } = mpesaConfig();
  const basic = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(
    `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${basic}` } },
  );
  if (!response.ok) throw new Error(`Daraja auth failed: ${response.status}`);

  const body: unknown = await response.json();
  if (!body || typeof body !== "object") {
    throw new Error("Daraja auth returned an invalid response");
  }
  const data = body as { access_token?: unknown; expires_in?: unknown };
  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new Error("Daraja auth response is missing an access token");
  }
  const expiresIn = Number(data.expires_in);
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error("Daraja auth response has an invalid token expiry");
  }

  cached = { token: data.access_token, exp: Date.now() + expiresIn * 1000 };
  return cached.token;
}

export const timestamp = () => new Date().toISOString().replace(/\D/g, "").slice(0, 14);

export function normalizeKePhone(raw: string): string | null {
  const match = raw.replace(/[\s-]/g, "").match(/^(?:\+?254|0)?([71]\d{8})$/);
  return match ? `254${match[1]}` : null;
}

async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(`${DARAJA_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + await getAccessToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json().catch(() => ({}));
  if (!result || typeof result !== "object") {
    throw new Error(`Daraja returned an invalid response (${response.status})`);
  }
  const data = result as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      String(data.errorMessage ?? data.ResponseDescription ?? `Daraja request failed (${response.status})`),
    );
  }
  return data;
}

export async function stkPush(p: {
  phone: string;
  amount: number;
  callbackUrl: string;
  reference: string;
  description: string;
}): Promise<{ checkoutRequestId: string; merchantRequestId: string }> {
  const { shortCode, passkey } = mpesaConfig();
  const ts = timestamp();
  const data = await post("/mpesa/stkpush/v1/processrequest", {
    BusinessShortCode: shortCode,
    Password: Buffer.from(`${shortCode}${passkey}${ts}`).toString("base64"),
    Timestamp: ts,
    TransactionType: process.env.MPESA_TXN_TYPE ?? "CustomerPayBillOnline",
    Amount: p.amount,
    PartyA: p.phone,
    PartyB: process.env.MPESA_PARTY_B ?? shortCode,
    PhoneNumber: p.phone,
    CallBackURL: p.callbackUrl,
    AccountReference: p.reference.slice(0, 12),
    TransactionDesc: p.description.slice(0, 13),
  });
  if (String(data.ResponseCode) !== "0") {
    throw new DarajaResponseError(
      String(data.errorMessage ?? data.ResponseDescription ?? "Daraja rejected the STK Push"),
    );
  }
  if (typeof data.CheckoutRequestID !== "string" || typeof data.MerchantRequestID !== "string") {
    throw new Error("Daraja STK Push response is missing request identifiers");
  }
  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  };
}

export async function stkQuery(checkoutRequestId: string) {
  const { shortCode, passkey } = mpesaConfig();
  const ts = timestamp();
  const data = await post("/mpesa/stkpushquery/v1/query", {
    BusinessShortCode: shortCode,
    Password: Buffer.from(`${shortCode}${passkey}${ts}`).toString("base64"),
    Timestamp: ts,
    CheckoutRequestID: checkoutRequestId,
  });
  if (data.ResultCode === undefined) {
    if (String(data.ResponseCode) === "0") return { state: "PENDING" as const };
    throw new Error(String(data.errorMessage ?? data.ResponseDescription ?? "Daraja status query failed"));
  }

  const resultCode = Number(data.ResultCode);
  if (!Number.isFinite(resultCode)) {
    throw new Error("Daraja status query returned an invalid result code");
  }
  return resultCode === 0
    ? { state: "PAID" as const }
    : { state: "FAILED" as const, code: resultCode, reason: String(data.ResultDesc ?? "") };
}
