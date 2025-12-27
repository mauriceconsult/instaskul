import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string; assignmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId, courseId, tutorId, assignmentId } = await params;
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    // Verify ownership
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId, userId },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attachment = await prisma.attachment.create({
      data: {
        url,      
        assignmentId,
        adminId,
        courseId,
        tutorId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("[TUTOR_ATTACHMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}