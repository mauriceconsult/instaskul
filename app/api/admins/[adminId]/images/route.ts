import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const body = await request.json();
  const { imageUrl } = body;
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!imageUrl || imageUrl.length === 0) {
    return new Response("No data provided", { status: 400 });
  }
  const admin = await prisma.admin.findUnique({
    where: {
      id: (await params).adminId,
      userId,
    },
  });
  if (!admin) {
    return new Response("Admin not found", { status: 404 });
  }
  await prisma.admin.update({
    where: {
      id: admin.id,
    },
    data: {
      imageUrl,
    },
  });
  return new Response("Success", { status: 200 });
}

