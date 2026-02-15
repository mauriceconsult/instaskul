# Mux Video Stuck on "Processing..." - Production Fix

## Why This Happens

In **development**, Mux processes videos almost instantly because:
- Test mode (`test: true`) uses smaller, pre-processed videos
- Immediate playback IDs

In **production** with `test: false`:
- Real video encoding takes time (1-5 minutes)
- PlaybackId isn't immediately available
- You need a **webhook** to update the playbackId when ready

---

## Current Situation

Your code creates the Mux asset:
```typescript
const asset = await mux.video.assets.create({
  input: videoUrl,
  playback_policy: ["public"],
  test: false, // Real processing in production
});

await prisma.muxData.create({
  data: {
    tutorId: tutor.id,
    assetId: asset.id,
    playbackId: asset.playback_ids?.[0]?.id || null, // ⚠️ This is NULL initially!
  },
});
```

The `playbackId` is **null** when first created, so your component shows "Processing..." forever.

---

## Solution: Set Up Mux Webhook

You already created the webhook handler (`/api/webhook/mux/route.ts`). Now you need to:

### Step 1: Register Webhook in Mux Dashboard

1. **Go to Mux Dashboard:** https://dashboard.mux.com
2. **Navigate to:** Settings → Webhooks
3. **Click:** "Create new webhook"
4. **Webhook URL:** `https://yourdomain.com/api/webhook/mux`
   - Replace with your actual production URL
   - Example: `https://instaskul.vercel.app/api/webhook/mux`
5. **Select Events:**
   - ✅ `video.asset.ready` (most important!)
   - ✅ `video.asset.errored` (for error handling)
   - ✅ `video.asset.created` (optional, for logging)
6. **Copy the Signing Secret** (looks like: `whsec_xxxxxxxxxxxxx`)
7. **Save**

### Step 2: Add Webhook Secret to Environment

Add to your production environment variables (Vercel/Railway):

```env
MUX_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 3: Update Your Webhook Handler

Your current webhook at `app/api/webhook/mux/route.ts` is good, but let's add better error handling:

```typescript
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
```

### Step 4: Install StandardWebhooks (for signature verification)

```bash
npm install standardwebhooks
```

Or use the simpler crypto approach (already in your code):

```typescript
import crypto from "crypto";

// Verify signature
if (webhookSecret && signature) {
  const timestamp = headersList.get("mux-timestamp");
  const payload = `${timestamp}.${body}`;
  
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");
  
  if (`v1,${expectedSignature}` !== signature) {
    console.error("Invalid webhook signature");
    return new NextResponse("Invalid signature", { status: 401 });
  }
}
```

---

## Alternative: Simple Polling Solution (No Webhook)

If you don't want to set up webhooks, you can poll Mux for the status:

### Option A: Client-Side Polling

Update your `TutorVideoForm` component:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const TutorVideoForm = ({ initialData, adminId, courseId, tutorId }: TutorVideoFormProps) => {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(false);

  // Poll for video processing status
  useEffect(() => {
    // Only poll if we have a video but no playbackId
    if (initialData.videoUrl && !initialData.muxData?.playbackId) {
      setIsPolling(true);
      
      const pollInterval = setInterval(() => {
        console.log("Polling for video status...");
        router.refresh(); // Refresh to check if playbackId is available
      }, 10000); // Poll every 10 seconds

      // Stop polling after 5 minutes (video processing shouldn't take longer)
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        setIsPolling(false);
        console.log("Stopped polling - check Mux dashboard for issues");
      }, 300000); // 5 minutes

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [initialData.videoUrl, initialData.muxData?.playbackId, router]);

  // Rest of your component...
}
```

### Option B: Server-Side Status Check

Create a new API route to check Mux status:

```typescript
// app/api/admins/[adminId]/courses/[courseId]/tutors/[tutorId]/mux-status/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Mux from "@mux/mux-node";

function getMuxClient() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("Mux credentials not configured");
  }
  return new Mux({ tokenId, tokenSecret });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ adminId: string; tutorId: string }> }
) {
  try {
    const { userId } = await auth();
    const { adminId, tutorId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get tutor with muxData
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: { muxData: true },
    });

    if (!tutor || !tutor.muxData) {
      return NextResponse.json({ ready: false });
    }

    // If we already have playbackId, return it
    if (tutor.muxData.playbackId) {
      return NextResponse.json({ 
        ready: true, 
        playbackId: tutor.muxData.playbackId 
      });
    }

    // Check Mux API for status
    const mux = getMuxClient();
    const asset = await mux.video.assets.retrieve(tutor.muxData.assetId);

    console.log("Mux asset status:", {
      assetId: asset.id,
      status: asset.status,
      playbackIds: asset.playback_ids,
    });

    // If asset is ready and has playbackId, update database
    if (asset.status === "ready" && asset.playback_ids?.[0]?.id) {
      await prisma.muxData.update({
        where: { id: tutor.muxData.id },
        data: { playbackId: asset.playback_ids[0].id },
      });

      return NextResponse.json({
        ready: true,
        playbackId: asset.playback_ids[0].id,
      });
    }

    // Still processing
    return NextResponse.json({ 
      ready: false, 
      status: asset.status 
    });

  } catch (error) {
    console.error("[MUX_STATUS_CHECK]", error);
    return new NextResponse("Error checking status", { status: 500 });
  }
}
```

Then update your component to use this:

```typescript
const checkMuxStatus = async () => {
  try {
    const response = await fetch(
      `/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}/mux-status`
    );
    const data = await response.json();
    
    if (data.ready) {
      console.log("Video ready!");
      router.refresh();
      setIsPolling(false);
    }
  } catch (error) {
    console.error("Error checking Mux status:", error);
  }
};
```

---

## Recommended Approach: Use the Webhook! ⭐

**Why webhook is better:**
- ✅ No polling overhead
- ✅ Instant update when ready
- ✅ Mux pushes updates to you
- ✅ More reliable
- ✅ Better for production

**Polling is okay for:**
- ❓ Quick MVP/testing
- ❓ When you can't set up webhooks
- ❓ Development environment

---

## Quick Test

After setting up the webhook, test it:

### 1. Upload a Video
Upload a small test video in production

### 2. Check Logs
Watch your production logs for:
```
[MUX_WEBHOOK] Event received: video.asset.ready
[MUX_WEBHOOK] Asset ready: { assetId: '...', playbackId: '...' }
[MUX_WEBHOOK] Updated 1 records
```

### 3. Check Mux Dashboard
Go to Mux dashboard → Assets
- Find your video
- Check status (should show "Ready")
- Verify playback ID exists

### 4. Refresh Page
After webhook fires, refresh your tutor page
- Video player should appear
- No more "Processing..." message

---

## Troubleshooting

### Webhook Not Firing?

**Check webhook logs in Mux:**
1. Mux Dashboard → Settings → Webhooks
2. Click on your webhook
3. See "Recent Deliveries"
4. Check for errors

**Common issues:**
- Wrong URL (typo in domain)
- Firewall blocking Mux
- Webhook secret mismatch
- Wrong events selected

### Still Showing "Processing..."?

**Check database:**
```sql
-- In Prisma Studio or SQL client
SELECT * FROM "MuxData" WHERE "tutorId" = 'your-tutor-id';

-- Check if playbackId is populated
```

**Check Mux asset:**
```bash
# Use Mux CLI or check dashboard
# Asset should show status: "ready"
# playback_ids should have at least one entry
```

**Manual fix (temporary):**
If webhook fails, you can manually update:
```typescript
// In Prisma Studio, set playbackId to the value from Mux dashboard
```

---

## Summary

**Your issue:** `playbackId` is null because Mux hasn't finished processing

**Best solution:** Set up Mux webhook
1. Register webhook in Mux dashboard
2. Add `MUX_WEBHOOK_SECRET` to env vars
3. Deploy changes
4. Test with a video upload

**Alternative:** Use polling (less ideal but works)

**Timeline:**
- Webhook setup: 10 minutes
- First video test: 1-3 minutes processing
- All future videos: Automatic updates when ready

Set up that webhook and you're golden! 🎉
