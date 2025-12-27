import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId } = await params;
    const body = await req.json();

    // Verify ownership
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, userId },
    });

    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: body, // e.g. { title, description, schoolId, imageUrl, etc. }
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.log("[ADMIN_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId } = await params;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId, userId },
      include: {
        courses: {
          where: { isPublished: true },
          include: {
            tutors: { where: { isPublished: true }, include: { muxData: true } },
          },
        },
      },
    });

    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const deletedAdmin = await prisma.admin.delete({
      where: { id: adminId },
    });

    return NextResponse.json(deletedAdmin);
  } catch (error) {
    console.log("[ADMIN_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}