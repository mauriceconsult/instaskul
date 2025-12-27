// app/api/admins/[adminId]/noticeboards/[noticeboardId]/publish/route.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ adminId: string; noticeboardId: string }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId, noticeboardId } = await params;

    // Fetch noticeboard with ownership check
    const noticeboard = await prisma.noticeboard.findUnique({
      where: {
        id: noticeboardId,
        adminId,
        userId,
      },
    });

    if (!noticeboard) {
      return NextResponse.json({ error: "Noticeboard not found or unauthorized" }, { status: 404 });
    }

    // Validate required fields
    if (!noticeboard.title?.trim() || !noticeboard.description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required to publish" },
        { status: 400 }
      );
    }

    // Publish the noticeboard
    const publishedNoticeboard = await prisma.noticeboard.update({
      where: { id: noticeboardId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedNoticeboard);
  } catch (error) {
    console.error("[NOTICEBOARD_PUBLISH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}