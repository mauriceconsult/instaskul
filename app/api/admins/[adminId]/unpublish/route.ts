import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId } = await params;

    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
        userId,
      },
    });

    if (!admin) {
      return new NextResponse("Not found", { status: 404 });
    }

    const unpublishedAdmin = await prisma.admin.update({
      where: {
        id: adminId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/dashboard/admins/${adminId}`);
    revalidatePath(`/dashboard/admins`);
    revalidatePath(`/admins/${adminId}`);

    return NextResponse.json(unpublishedAdmin);
  } catch (error) {
    console.log("[ADMIN_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}