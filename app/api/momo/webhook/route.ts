import { dispatchMoMoWebhook } from "@/lib/payments/webhook-dispatcher";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    await dispatchMoMoWebhook(payload);

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.error("[MoMo Webhook]", error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}