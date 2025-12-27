import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId } = await params;
    const { title } = await req.json();

    if (!title?.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId, userId },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get last position
    const lastTutorial = await prisma.tutor.findFirst({
      where: { courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (lastTutorial?.position ?? 0) + 1;

    // Create tutor with required userId
    const tutor = await prisma.tutor.create({
      data: {
        title: title.trim(),
        courseId,
        userId, 
        position: newPosition,
      },
    });

    return NextResponse.json(tutor);
  } catch (error) {
    console.log("[TUTORIAL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}