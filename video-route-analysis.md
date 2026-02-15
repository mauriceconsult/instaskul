# Video Upload Route Analysis & Fixes

## Issues Found in Your Code

### Issue 1: Empty String Fallback for Mux Credentials ⚠️

**Problem:**
```typescript
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || "",
  tokenSecret: process.env.MUX_TOKEN_SECRET || "",
});
```

**Why this is problematic:**
- If env vars are missing, Mux initializes with empty strings
- You check later, but Mux client is already created with bad credentials
- In production, this might cause silent failures

**Fix:**
```typescript
// Move Mux initialization inside the function where you check credentials
// OR use a getter function

function getMuxClient() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("Mux credentials not configured");
  }
  
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });
}

// Then in your PATCH function:
export async function PATCH(request: Request, { params }: ...) {
  try {
    // ... existing code ...
    
    if (body.videoUrl !== undefined && body.videoUrl !== tutor.videoUrl) {
      const mux = getMuxClient(); // Initialize here with check
      
      // ... rest of your Mux logic
    }
  } catch (error) {
    // ...
  }
}
```

---

### Issue 2: Potential Race Condition with PlaybackId

**Problem:**
```typescript
const asset = await mux.video.assets.create({
  input: body.videoUrl,
  playback_policy: ["public"],
  test: false,
});

await prisma.muxData.create({
  data: {
    tutorId: tutor.id,
    assetId: asset.id,
    playbackId: asset.playback_ids?.[0]?.id || null, // ⚠️ Might be null initially
  },
});
```

**Why this happens:**
- Mux asset creation is asynchronous
- `playback_ids` might not be available immediately
- The video shows "Processing..." forever because playbackId is null

**Fix Option 1: Poll for Playback ID**
```typescript
// Create asset
const asset = await mux.video.assets.create({
  input: body.videoUrl,
  playback_policy: ["public"],
  test: false,
});

console.log("Mux asset created:", asset.id);

// Save with null playbackId initially
await prisma.muxData.create({
  data: {
    tutorId: tutor.id,
    assetId: asset.id,
    playbackId: null, // Will be updated by webhook or polling
  },
});

// If playback_ids are immediately available (rare), update
if (asset.playback_ids?.[0]?.id) {
  await prisma.muxData.update({
    where: { assetId: asset.id },
    data: { playbackId: asset.playback_ids[0].id },
  });
}
```

**Fix Option 2: Use Mux Webhooks (Recommended)**

Create a webhook handler at `app/api/webhook/mux/route.ts`:

```typescript
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
```

Then configure in Mux Dashboard:
1. Go to Settings → Webhooks
2. Add: `https://yourdomain.com/api/webhook/mux`
3. Copy the signing secret to `MUX_WEBHOOK_SECRET` env var
4. Select events: `video.asset.ready`, `video.asset.errored`

---

### Issue 3: VideoUrl Update Timing

**Problem:**
```typescript
// Update tutor first with non-video fields
let updatedTutor = await prisma.tutor.update({
  where: { id: tutorId },
  data: {
    ...body,
    videoUrl: body.videoUrl !== undefined ? body.videoUrl : tutor.videoUrl,
  },
});

// Handle video URL updates separately
if (body.videoUrl !== undefined && body.videoUrl !== tutor.videoUrl) {
  // Process video...
}
```

**Issue:**
- You update videoUrl in the first update
- Then check if it's different from original
- The comparison might fail because you already updated it

**Fix:**
```typescript
// Store the original videoUrl BEFORE any updates
const originalVideoUrl = tutor.videoUrl;

// Extract videoUrl from body to handle separately
const { videoUrl, ...otherFields } = body;

// Update only non-video fields first
let updatedTutor = await prisma.tutor.update({
  where: { id: tutorId },
  data: otherFields,
  include: { muxData: true },
});

// Handle video URL updates separately
if (videoUrl !== undefined && videoUrl !== originalVideoUrl) {
  console.log("Processing new video URL:", videoUrl);
  
  // ... rest of video processing logic
  
  // Update videoUrl after Mux processing succeeds
  updatedTutor = await prisma.tutor.update({
    where: { id: tutorId },
    data: { videoUrl },
    include: { muxData: true },
  });
}
```

---

### Issue 4: Error Handling in Production

**Problem:**
- Generic error messages don't help debug production issues
- Need better logging for production

**Fix:**
Add structured logging:

```typescript
export async function PATCH(request: Request, { params }: ...) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const body = await request.json();
    const { userId } = await auth();
    const { adminId, courseId, tutorId } = await params;

    console.log(`[${requestId}] PATCH Request:`, {
      adminId,
      courseId,
      tutorId,
      userId,
      hasVideoUrl: !!body.videoUrl,
      bodyKeys: Object.keys(body),
    });

    // ... existing checks ...

    if (videoUrl !== undefined && videoUrl !== originalVideoUrl) {
      console.log(`[${requestId}] Creating Mux asset for:`, {
        videoUrl: videoUrl.substring(0, 50) + "...",
        tutorId,
      });

      try {
        const asset = await mux.video.assets.create({
          input: videoUrl,
          playback_policy: ["public"],
          test: false,
        });

        console.log(`[${requestId}] Mux asset created:`, {
          assetId: asset.id,
          status: asset.status,
          hasPlaybackId: !!asset.playback_ids?.[0]?.id,
        });

        // ... save to database ...

      } catch (muxError: any) {
        console.error(`[${requestId}] Mux creation failed:`, {
          error: muxError.message,
          response: muxError.response?.data,
          status: muxError.response?.status,
        });
        
        return new NextResponse(
          JSON.stringify({
            error: "Video processing failed",
            details: process.env.NODE_ENV === "development" 
              ? muxError.message 
              : "Please try again",
            requestId,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`[${requestId}] Update successful`);
    return NextResponse.json(updatedTutor);

  } catch (error: any) {
    console.error(`[${requestId}] PATCH Error:`, {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        requestId,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

---

## Complete Refactored Version

Here's your route with all fixes applied:

```typescript
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Initialize Mux with proper error handling
function getMuxClient() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    throw new Error("Mux credentials not configured. Check MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables.");
  }

  return new Mux({ tokenId, tokenSecret });
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ adminId: string; courseId: string; tutorId: string }>;
  }
) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const body = await request.json();
    const { userId } = await auth();
    const { adminId, courseId, tutorId } = await params;

    console.log(`[${requestId}] PATCH Request:`, {
      adminId,
      courseId,
      tutorId,
      userId,
      bodyKeys: Object.keys(body),
    });

    // Auth checks
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify admin ownership
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, userId },
    });

    if (!admin) {
      return new NextResponse("Unauthorized - Invalid admin", { status: 401 });
    }

    // Get existing tutor
    const tutor = await prisma.tutor.findUnique({
      where: {
        id: tutorId,
        courseId,
      },
      include: { muxData: true },
    });

    if (!tutor) {
      return new NextResponse("Tutor not found", { status: 404 });
    }

    // Store original videoUrl for comparison
    const originalVideoUrl = tutor.videoUrl;

    // Separate video URL from other fields
    const { videoUrl, ...otherFields } = body;

    // Update non-video fields first
    let updatedTutor = await prisma.tutor.update({
      where: { id: tutorId },
      data: otherFields,
      include: { muxData: true },
    });

    // Handle video URL updates
    if (videoUrl !== undefined && videoUrl !== originalVideoUrl) {
      console.log(`[${requestId}] Processing video URL change`);

      if (!videoUrl || videoUrl.length === 0) {
        // Delete existing Mux data if removing video
        if (tutor.muxData) {
          try {
            const mux = getMuxClient();
            await mux.video.assets.delete(tutor.muxData.assetId);
          } catch (error) {
            console.error(`[${requestId}] Mux deletion error:`, error);
          }
          await prisma.muxData.delete({
            where: { id: tutor.muxData.id },
          });
        }

        // Update tutor to remove videoUrl
        updatedTutor = await prisma.tutor.update({
          where: { id: tutorId },
          data: { videoUrl: null },
          include: { muxData: true },
        });
      } else {
        // New video URL provided
        try {
          const mux = getMuxClient();

          // Delete existing Mux data if present
          if (tutor.muxData) {
            console.log(`[${requestId}] Deleting old Mux asset:`, tutor.muxData.assetId);
            try {
              await mux.video.assets.delete(tutor.muxData.assetId);
            } catch (error) {
              console.warn(`[${requestId}] Old asset deletion failed (may not exist):`, error);
            }
            await prisma.muxData.delete({
              where: { id: tutor.muxData.id },
            });
          }

          // Create new Mux asset
          console.log(`[${requestId}] Creating Mux asset`);
          
          const asset = await mux.video.assets.create({
            input: videoUrl,
            playback_policy: ["public"],
            test: false, // CRITICAL: must be false in production
          });

          console.log(`[${requestId}] Mux asset created:`, {
            assetId: asset.id,
            status: asset.status,
            hasPlaybackId: !!asset.playback_ids?.[0]?.id,
          });

          // Save Mux data (playbackId might be null initially)
          await prisma.muxData.create({
            data: {
              tutorId: tutor.id,
              assetId: asset.id,
              playbackId: asset.playback_ids?.[0]?.id || null,
            },
          });

          // If playback ID is immediately available, great!
          // Otherwise, webhook will update it when ready

          // Update tutor with new videoUrl
          updatedTutor = await prisma.tutor.update({
            where: { id: tutorId },
            data: { videoUrl },
            include: { muxData: true },
          });

          console.log(`[${requestId}] Video processing initiated successfully`);

        } catch (muxError: any) {
          console.error(`[${requestId}] Mux error:`, {
            message: muxError.message,
            response: muxError.response?.data,
          });

          return new NextResponse(
            JSON.stringify({
              error: "Video processing failed",
              details: process.env.NODE_ENV === "development" 
                ? muxError.message 
                : "Please try again or contact support",
              requestId,
            }),
            { 
              status: 500, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }
      }
    }

    // Revalidate the path
    revalidatePath(
      `/dashboard/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`
    );

    console.log(`[${requestId}] Update completed successfully`);
    return NextResponse.json(updatedTutor);

  } catch (error: any) {
    console.error(`[${requestId}] Unhandled error:`, {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        requestId,
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
```

---

## Production Debugging Steps

1. **Check Production Logs:**
   ```bash
   # Vercel
   vercel logs --follow
   
   # Look for the [requestId] in logs
   ```

2. **Verify Environment Variables:**
   ```bash
   # In Vercel Dashboard: Settings → Environment Variables
   # Make sure these are set:
   - MUX_TOKEN_ID
   - MUX_TOKEN_SECRET
   - DATABASE_URL
   ```

3. **Test Mux Connection:**
   Add a test endpoint:
   ```typescript
   // app/api/test-mux/route.ts
   import { getMuxClient } from "../path-to-your-function";
   
   export async function GET() {
     try {
       const mux = getMuxClient();
       const assets = await mux.video.assets.list({ limit: 1 });
       return Response.json({ success: true, count: assets.length });
     } catch (error: any) {
       return Response.json({ 
         success: false, 
         error: error.message 
       }, { status: 500 });
     }
   }
   ```

4. **Check Mux Dashboard:**
   - Go to Mux dashboard
   - Check if assets are being created
   - Look at asset status (preparing/ready/errored)

5. **Monitor Database:**
   ```typescript
   // Check MuxData table
   const muxRecords = await prisma.muxData.findMany({
     where: { tutorId: "your-tutor-id" },
     include: { tutor: true },
   });
   console.log(muxRecords);
   ```

---

## Quick Fixes to Try First

1. **Ensure `test: false` in production**
2. **Add Mux webhook** (most important for playbackId)
3. **Check environment variables** are actually set
4. **Look at production logs** for specific errors
5. **Try with a small test video** (< 10MB)

The webhook is probably the missing piece - without it, playbackId might never update!
