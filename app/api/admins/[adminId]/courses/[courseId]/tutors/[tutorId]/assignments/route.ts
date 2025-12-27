import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, tutorId } = await params;
    const { title } = await req.json();

    if (!title?.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Verify ownership
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId, userId },
    });

    if (!tutor) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get last position
    const lastAssignment = await prisma.assignment.findFirst({
      where: { tutorId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (lastAssignment?.position ?? 0) + 1;

    // Create tutor with required userId
    const assignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        tutorId,
        userId, 
        position: newPosition,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.log("[ASSIGNMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}