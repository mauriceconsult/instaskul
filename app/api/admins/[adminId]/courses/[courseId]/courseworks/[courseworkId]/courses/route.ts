import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; courseworkId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    } 
    const coursework = await prisma.coursework.findUnique({
      where: {
        id: (await params).courseworkId,
        userId: userId,
      },
    });
    if (!coursework) {
      return new NextResponse("Not found", { status: 404 });
    }
    const deletedCoursework = await prisma.coursework.delete({
      where: {
        id: (await params).courseworkId,
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
  { params }: { params: Promise<{ adminId: string; courseId: string; courseworkId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseworkId } = await params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const ownCoursework = await prisma.coursework.findUnique({
      where: {
        id: courseworkId,
        userId,
      }
    })
    if (!ownCoursework) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    const coursework = await prisma.coursework.update({
      where: {
        id: courseworkId,
        userId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(coursework);
  } catch (error) {
    console.log("[COURSEWORK_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
