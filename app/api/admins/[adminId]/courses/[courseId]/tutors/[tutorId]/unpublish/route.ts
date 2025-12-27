import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server.js";


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string; }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }   
    const ownTutor = await prisma.tutor.findUnique({
      where: {
        id: (await params).tutorId,
        userId,
      },
    });
    if (!ownTutor) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unpublishedTutor = await prisma.tutor.update({
      where: {
        id: (await params).tutorId,
        courseId: (await params).courseId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedTutors = await prisma.tutor.findMany({
      where: {
        id: (await params).tutorId,
        courseId: (await params).courseId,
        isPublished: true,
      },
    });
    if (!publishedTutors.length) {
      await prisma.course.update({
        where: {
          id: (await params).courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishedTutor);
  } catch (error) {
    console.log("[TUTORIAL_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
