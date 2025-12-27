// app/api/admins/[adminId]/courses/[courseId]/tutors/[tutorId]/route.ts
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

    // Handle video URL updates separately
    if (body.videoUrl !== undefined) {
      if (!body.videoUrl || body.videoUrl.length === 0) {
        return new NextResponse("Video URL is required", { status: 400 });
      }

      // Delete existing Mux data if changing video
      const existingMuxData = await prisma.muxData.findFirst({
        where: { tutorId: tutor.id },
      });

      if (existingMuxData) {
        try {
          await mux.video.assets.delete(existingMuxData.assetId);
        } catch (error) {
          console.error("Mux deletion error:", error);
        }
        await prisma.muxData.delete({
          where: { id: existingMuxData.id },
        });
      }

      // Create new Mux asset
      const asset = await mux.video.assets.create({
        input: body.videoUrl,
        playback_policy: ["public"],
        test: false,
      });

      await prisma.muxData.create({
        data: {
          tutorId: tutor.id,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id || null,
        },
      });
    }

    // Update tutor with all provided fields
    const updatedTutor = await prisma.tutor.update({
      where: { id: tutorId },
      data: body,
      include: { muxData: true },
    });

    revalidatePath(
      `/dashboard/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`
    );

    return NextResponse.json(updatedTutor);
  } catch (error) {
    console.error("[TUTORIAL_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}