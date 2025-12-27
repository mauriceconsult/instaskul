import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { adminId } = await params;
    const { title } = await req.json();

    if (!title?.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Verify ownership
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, userId },
    });

    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get last position
    const lastNoticeboard = await prisma.noticeboard.findFirst({
      where: { adminId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (lastNoticeboard?.position ?? 0) + 1;

    // Create noticeboard with required userId
    const noticeboard = await prisma.noticeboard.create({
      data: {
        title: title.trim(),
        adminId,
        userId, 
        position: newPosition,
      },
    });

    return NextResponse.json(noticeboard);
  } catch (error) {
    console.log("[NOTICEBOARD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}