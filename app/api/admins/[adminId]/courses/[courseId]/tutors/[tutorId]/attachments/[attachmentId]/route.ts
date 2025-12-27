import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string; attachmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const tutorOwner = await prisma.tutor.findUnique({
      where: {
        id: (await params).tutorId,
        userId: userId,
      },
    });
    if (!tutorOwner) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const attachment = await prisma.attachment.delete({
      where: {
        adminId: (await params).adminId,
        id: (await params).attachmentId,
      },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.log("TUTOR_ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
