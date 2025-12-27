import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server.js";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      adminId: string;
      noticeboardId: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const ownNoticeboard = await prisma.noticeboard.findUnique({
      where: {
        id: (await params).noticeboardId,
        userId,
      },
    });
    if (!ownNoticeboard) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const unpublishedNoticeboard = await prisma.noticeboard.update({
      where: {
        id: (await params).noticeboardId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedNoticeboard = await prisma.noticeboard.findMany({
      where: {
        id: (await params).noticeboardId,
        isPublished: true,
      },
    });
    if (!publishedNoticeboard.length) {
      await prisma.noticeboard.update({
        where: {
          id: (await params).noticeboardId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishedNoticeboard);
  } catch (error) {
    console.log("[NOTICEBOARD_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
