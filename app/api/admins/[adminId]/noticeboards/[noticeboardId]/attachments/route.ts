// app/api/admins/[adminId]/noticeboards/[noticeboardId]/attachments/route.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ adminId: string; noticeboardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId, noticeboardId } = await params;
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    // Verify ownership
    const noticeboard = await prisma.noticeboard.findUnique({
      where: { id: noticeboardId, adminId, admin: { userId } },
    });

    if (!noticeboard) {
      return NextResponse.json({ error: "Unauthorized or noticeboard not found" }, { status: 401 });
    }

    const attachment = await prisma.attachment.create({
      data: {
        url,
        noticeboardId,
        adminId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("[NOTICEBOARD_ATTACHMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}