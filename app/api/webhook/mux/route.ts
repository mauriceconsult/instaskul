import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("mux-signature");
    
    // Verify webhook signature (important for security!)
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return new NextResponse("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log("Mux webhook event:", event.type);

    // Handle video.asset.ready event
    if (event.type === "video.asset.ready") {
      const assetId = event.data.id;
      const playbackId = event.data.playback_ids?.[0]?.id;

      if (playbackId) {
        console.log("Updating playbackId for asset:", assetId);
        
        await prisma.muxData.updateMany({
          where: { assetId },
          data: { playbackId },
        });

        console.log("PlaybackId updated successfully");
      }
    }

    // Handle errors
    if (event.type === "video.asset.errored") {
      console.error("Mux asset error:", event.data);
      // Optionally delete the failed muxData record
      await prisma.muxData.deleteMany({
        where: { assetId: event.data.id },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[MUX_WEBHOOK]", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}