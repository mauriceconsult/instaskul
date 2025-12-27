import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { adminId: string; noticeboardId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const noticeboard = await prisma.noticeboard.findFirst({
      where: {
        id: params.noticeboardId,
        userId,
        adminId: params.adminId,
      },
    });

    if (!noticeboard) {
      return new NextResponse("Not found", { status: 404 });
    }

    const deletedNoticeboard = await prisma.noticeboard.delete({
      where: { id: params.noticeboardId },
    });

    return NextResponse.json(deletedNoticeboard);
  } catch (error) {
    console.log("[NOTICEBOARD_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: { adminId: string; noticeboardId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();

    const noticeboard = await prisma.noticeboard.updateMany({
      where: {
        id: params.noticeboardId,
        userId,
        adminId: params.adminId,
      },
      data: values,
    });

    return NextResponse.json(noticeboard);
  } catch (error) {
    console.log("[NOTICEBOARD_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

