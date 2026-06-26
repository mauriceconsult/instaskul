import { MoMoWebhookPayload } from "@/lib/payments/momo";

const STUDIO_URL = process.env.STUDIO_URL!;

export async function handleStudio(
  payload: MoMoWebhookPayload
) {
  await fetch(
    `${STUDIO_URL}/api/webhooks/momo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.PLATFORM_API_KEY!,
      },
      body: JSON.stringify(payload),
    }
  );
}