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