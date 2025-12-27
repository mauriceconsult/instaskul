import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
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
        userId: userId,
      },
    });
    if (!admin) {
      return new NextResponse("Not found", { status: 404 });
    }
    const deletedAdmin = await prisma.admin.delete({
      where: {
        id: (await params).adminId,
      },
    });
    return NextResponse.json(deletedAdmin);
  } catch (error) {
    console.log("[SCHOOL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string }>}
) {
  try {
    const { userId } = await auth();
    const { adminId } = await params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const ownAdmin = await prisma.admin.findUnique({
          where: {
            id: (await params).adminId,
            userId,
          }
        })
        if (!ownAdmin) {
          return new NextResponse("Unauthorized", { status: 401 });
        }
    const admin = await prisma.admin.update({
      where: {
        id: adminId,
        userId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(admin);
  } catch (error) {
    console.log("[SCHOOL_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
