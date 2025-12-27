import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const admin = await prisma.admin.findUnique({
      where: {
        id: (await params).adminId,
        userId,
        },
        include: {
          courses: true,
      }  
    });
    if (!admin) {
      return new NextResponse("Not found", { status: 404 });
    }
    const hasPublishedCourse = admin.courses.some(
      (course) => course.isPublished
    );
    if (
      !admin.title ||
      !admin.description ||
      !admin.imageUrl ||
      !admin.schoolId ||
      !hasPublishedCourse
    ) {
      return new NextResponse("Missing required fields", { status: 401 });
    }
    const publishedAdmin = await prisma.admin.update({
      where: {
        id: (await params).adminId,
        userId,
      },
      data: {
        isPublished: true,
      },
    });
    return NextResponse.json(publishedAdmin);
  } catch (error) {
    console.log("[ADMIN_ID_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
