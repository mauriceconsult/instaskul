import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// app/api/admins/[adminId]/courses/[courseId]/amounts/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { adminId: string; courseId: string } }
) {
  try {
    const { userId } = await auth();
    const { amount, currency } = await req.json();

    if (!userId || userId !== params.adminId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await prisma.course.update({
      where: {
        id: params.courseId,
        userId: params.adminId,
      },
      data: {
        amount,
        currency: currency || "UGX",
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_AMOUNT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}