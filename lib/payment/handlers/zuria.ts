import { MoMoWebhookPayload } from "@/lib/payments/momo";

const ZURIA_URL = process.env.ZURIA_API_URL!;
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY!;

export async function handleZuria(payload: MoMoWebhookPayload) {
  try {
    const res = await fetch(`${ZURIA_URL}/api/webhook/momo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLATFORM_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000), // 8s — leaves headroom inside MTN's webhook timeout
    });

    if (!res.ok) {
      console.error("[MoMo] Zuria forward failed", {
        referenceId: payload.referenceId,
        status: res.status,
      });
      // TODO: write to a dead-letter table for manual replay
    }
  } catch (err) {
    console.error("[MoMo] Zuria forward error", {
      referenceId: payload.referenceId,
      error: err instanceof Error ? err.message : err,
    });
    // TODO: write to a dead-letter table for manual replay
  }
}