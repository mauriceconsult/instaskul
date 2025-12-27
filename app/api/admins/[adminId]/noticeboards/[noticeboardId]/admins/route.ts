import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server.js";


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; noticeboardId: string; }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const noticeboard = await prisma.noticeboard.findUnique({
      where: {
        id: (await params).noticeboardId,
        userId: userId,
      },
    });
    if (!noticeboard) {
      return new NextResponse("Not found", { status: 404 });
    }
    const deletedNoticeboard = await prisma.noticeboard.delete({
      where: {
        id: (await params).noticeboardId,
      },
    });
    return NextResponse.json(deletedNoticeboard);
  } catch (error) {
    console.log("[ADMIN_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string; noticeboardId: string }>}
) {
  try {
    const { userId } =await auth();
    const { noticeboardId } = await params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const noticeboard = await prisma.noticeboard.update({
      where: {
        id: noticeboardId,
        userId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(noticeboard);
  } catch (error) {
    console.log("[ADMIN_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
