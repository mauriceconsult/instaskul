import { MoMoWebhookPayload } from "@/lib/payments/momo";

const MAXINTEL_URL = process.env.MAXINTEL_URL!;

export async function handleMaxintel(
  payload: MoMoWebhookPayload,
) {
  await fetch(
    `${MAXINTEL_URL}/api/webhooks/momo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.PLATFORM_API_KEY!,
      },
      body: JSON.stringify(payload),
    },
  );
}