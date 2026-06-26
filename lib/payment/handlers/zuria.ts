import { MoMoWebhookPayload } from "@/lib/payments/momo";

const ZURIA_URL = process.env.ZURIA_API_URL!;
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY!;

export async function handleZuria(payload: MoMoWebhookPayload) {
  const res = await fetch(
    `${ZURIA_URL}/api/webhook/momo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLATFORM_API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to forward webhook to Zuria");
  }
}