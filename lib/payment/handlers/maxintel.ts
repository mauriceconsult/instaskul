import { MoMoWebhookPayload } from "@/lib/payments/momo";

const MAXINTEL_URL    = process.env.MAXINTEL_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY!;

export async function handleMaxintel(payload: MoMoWebhookPayload): Promise<void> {
  try {
    const res = await fetch(`${MAXINTEL_URL}/billing/webhook`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "X-Platform-Key": PLATFORM_API_KEY,
      },
      body:   JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.error("[handleMaxintel] Forward failed", {
        referenceId: payload.referenceId,
        status:      res.status,
      });
    }
  } catch (err) {
    console.error("[handleMaxintel] Forward error", {
      referenceId: payload.referenceId,
      error:       err instanceof Error ? err.message : err,
    });
  }
}