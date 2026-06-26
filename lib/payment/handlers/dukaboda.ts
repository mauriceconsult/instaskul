import { MoMoWebhookPayload } from "@/lib/payments/momo";

const DUKABODA_URL = process.env.DUKABODA_API_URL!;

export async function handleDukaboda(
  payload: MoMoWebhookPayload
) {
  await fetch(
    `${DUKABODA_URL}/api/webhooks/momo`,
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