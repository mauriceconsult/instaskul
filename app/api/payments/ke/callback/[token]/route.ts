import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { reconcile } from "@/lib/mpesa/settle";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const expected = process.env.MPESA_CALLBACK_TOKEN ?? "";
  const a = Buffer.from(token), b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cb = (await req.json().catch(() => null))?.Body?.stkCallback;
  if (cb?.CheckoutRequestID) {
    const receipt = cb.CallbackMetadata?.Item?.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    try {
      await reconcile(cb.CheckoutRequestID, receipt?.toString());
    } catch (e) {
      console.error("[KE_CALLBACK]", (e as Error).message); // no payload, no phone number
    }
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }); // the status route will reconcile anything we missed
}