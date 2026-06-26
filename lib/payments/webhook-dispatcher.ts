import { handleDukaboda } from "../payment/handlers/dukaboda";
import { handleInstaskul } from "../payment/handlers/instaskul";
import { handleStudio } from "../payment/handlers/studio";
import { handleZuria } from "../payment/handlers/zuria";
import type { MoMoWebhookPayload } from "./momo";

export async function dispatchMoMoWebhook(
  payload: MoMoWebhookPayload
) {
  const ref = payload.referenceId;

  if (ref.startsWith("COL-")) {
    return handleInstaskul(payload);
  }

  if (ref.startsWith("PAY-")) {
    return handleInstaskul(payload);
  }

  if (ref.startsWith("ORD-")) {
    return handleZuria(payload);
  }

  if (ref.startsWith("DEL-")) {
    return handleDukaboda(payload);
  }

  if (
    ref.startsWith("SUB-") ||
    ref.startsWith("TOP-")
  ) {
    return handleStudio(payload);
  }

  console.warn("Unknown MoMo reference:", ref);

  return;
}