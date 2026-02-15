import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    
    // Get signature from headers
    const signature = headersList.get("mux-signature");
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        console.error("Missing Mux signature header");
        return new NextResponse("Missing signature", { status: 401 });
      }

      try {
        // Mux uses standard webhook signature format
        const wh = new Webhook(webhookSecret);
        wh.verify(body, {
          "mux-signature": signature,
        });
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new NextResponse("Invalid signature", { status: 401 });
      }
    } else {
      console.warn("MUX_WEBHOOK_SECRET not set - skipping signature verification");
    }

    const event = JSON.parse(body);
    console.log("[MUX_WEBHOOK] Event received:", event.type);

    // Handle video.asset.ready event
    if (event.type === "video.asset.ready") {
      const assetId = event.data.id;
      const playbackId = event.data.playback_ids?.[0]?.id;

      console.log("[MUX_WEBHOOK] Asset ready:", {
        assetId,
        playbackId,
        status: event.data.status,
      });

      if (playbackId) {
        // Update the playbackId in database
        const updated = await prisma.muxData.updateMany({
          where: { assetId },
          data: { playbackId },
        });

        console.log("[MUX_WEBHOOK] Updated", updated.count, "records");

        if (updated.count === 0) {
          console.warn("[MUX_WEBHOOK] No records found for assetId:", assetId);
        }
      } else {
        console.warn("[MUX_WEBHOOK] No playbackId in event data");
      }
    }

    // Handle video.asset.errored event
    if (event.type === "video.asset.errored") {
      const assetId = event.data.id;
      const errors = event.data.errors;

      console.error("[MUX_WEBHOOK] Asset error:", {
        assetId,
        errors: errors || event.data.error_message,
      });

      // Optionally delete the failed record
      await prisma.muxData.deleteMany({
        where: { assetId },
      });

      console.log("[MUX_WEBHOOK] Deleted failed asset:", assetId);
    }

    // Log other events
    if (event.type === "video.asset.created") {
      console.log("[MUX_WEBHOOK] Asset created:", event.data.id);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[MUX_WEBHOOK] Error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}