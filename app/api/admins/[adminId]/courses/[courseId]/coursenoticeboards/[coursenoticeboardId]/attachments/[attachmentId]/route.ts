import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; coursenoticeboardId: string; attachmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const coursenoticeboardOwner = await prisma.courseNoticeboard.findUnique({
      where: {
        id: (await params).coursenoticeboardId,
        userId: userId,
      },
    });
    if (!coursenoticeboardOwner) {
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
    console.log("COURSENOTICEBOARD_ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
