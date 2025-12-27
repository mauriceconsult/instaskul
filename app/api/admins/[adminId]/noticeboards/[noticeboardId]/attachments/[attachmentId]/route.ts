import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; attachmentId: string; noticeboardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const noticeboardOwner = await prisma.noticeboard.findUnique({
      where: {
        id: (await params).noticeboardId,
        userId: userId,
      },
    });
    if (!noticeboardOwner) {
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
    console.log("NOTICEBOARD_ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
