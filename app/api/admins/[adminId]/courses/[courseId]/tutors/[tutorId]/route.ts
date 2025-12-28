import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || "",
  tokenSecret: process.env.MUX_TOKEN_SECRET || "",
});

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ adminId: string; courseId: string; tutorId: string }>;
  }
) {
  try {
    const body = await request.json();
    const { userId } = await auth();
    const { adminId, courseId, tutorId } = await params;

    console.log("PATCH Params:", { adminId, courseId, tutorId });
    console.log("Request body:", body);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify tutor ownership
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

    // Verify admin ownership
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, userId },
    });

    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update tutor first with non-video fields
    let updatedTutor = await prisma.tutor.update({
      where: { id: tutorId },
      data: {
        ...body,
        // Don't update videoUrl yet if it's changing
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : tutor.videoUrl,
      },
      include: { muxData: true },
    });

    // Handle video URL updates separately
    if (body.videoUrl !== undefined && body.videoUrl !== tutor.videoUrl) {
      console.log("Processing video URL:", body.videoUrl);
      
      if (!body.videoUrl || body.videoUrl.length === 0) {
        return new NextResponse("Video URL is required", { status: 400 });
      }

      // Check for Mux credentials
      if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
        console.error("Mux credentials missing!");
        return new NextResponse("Mux configuration error", { status: 500 });
      }

      // Delete existing Mux data if changing video
      const existingMuxData = await prisma.muxData.findFirst({
        where: { tutorId: tutor.id },
      });

      if (existingMuxData) {
        console.log("Deleting existing Mux data:", existingMuxData.assetId);
        try {
          await mux.video.assets.delete(existingMuxData.assetId);
          console.log("Mux asset deleted successfully");
        } catch (error) {
          console.error("Mux deletion error:", error);
        }
        await prisma.muxData.delete({
          where: { id: existingMuxData.id },
        });
        console.log("Database MuxData deleted");
      }

      // Create new Mux asset
      console.log("Creating Mux asset for:", body.videoUrl);
      
      try {
        const asset = await mux.video.assets.create({
          input: body.videoUrl,
          playback_policy: ["public"],
          test: false,
        });

        console.log("Mux asset created:", {
          assetId: asset.id,
          status: asset.status,
          playbackIds: asset.playback_ids,
        });

        await prisma.muxData.create({
          data: {
            tutorId: tutor.id,
            assetId: asset.id,
            playbackId: asset.playback_ids?.[0]?.id || null,
          },
        });

        console.log("MuxData created in database");

        // Re-query the tutor to get the fresh muxData relation
        updatedTutor = await prisma.tutor.findUnique({
          where: { id: tutorId },
          include: { muxData: true },
        }) || updatedTutor;

        console.log("Re-queried tutor with muxData:", {
          id: updatedTutor.id,
          hasMuxData: !!updatedTutor.muxData,
          playbackId: updatedTutor.muxData?.playbackId,
        });

      } catch (muxError: any) {
        console.error("Mux asset creation failed:", muxError);
        return new NextResponse(
          `Mux error: ${muxError.message}`,
          { status: 500 }
        );
      }
    }

    revalidatePath(
      `/dashboard/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`
    );

    return NextResponse.json(updatedTutor);
  } catch (error) {
    console.error("[TUTORIAL_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}