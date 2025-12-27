import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const tutor = await prisma.tutor.findUnique({
      where: {
        id: (await params).tutorId,
            userId: userId,
        courseId: (await params).courseId,
      },
    });
    if (!tutor) {
      return new NextResponse("Not found", { status: 404 });
    }
    const deletedCoursework = await prisma.tutor.delete({
      where: {
        id: (await params).tutorId,
      },
    });
    return NextResponse.json(deletedCoursework);
  } catch (error) {
    console.log("[COURSEWORK_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
    { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string }> }
) {
  try {
    const { userId } = await auth();
    const { adminId, courseId, tutorId } = await params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const tutor = await prisma.tutor.update({
      where: {
        id: tutorId,
            userId,
        courseId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(tutor);
  } catch (error) {
    console.log("[COURSEWORK_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
