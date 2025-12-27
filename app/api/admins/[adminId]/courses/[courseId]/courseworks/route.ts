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
    const lastCoursework = await prisma.coursework.findFirst({
      where: { courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (lastCoursework?.position ?? 0) + 1;

    // Create coursework with required userId
    const coursework = await prisma.coursework.create({
      data: {
        title: title.trim(),
        courseId,
        userId, 
        position: newPosition,
      },
    });

    return NextResponse.json(coursework);
  } catch (error) {
    console.log("[COURSEWORK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}