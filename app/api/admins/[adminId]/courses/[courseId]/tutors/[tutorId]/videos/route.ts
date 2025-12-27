import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string }> }
) {
  const body = await request.json();
  const { videoUrl } = body;
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!videoUrl || videoUrl.length === 0) {
    return new Response("No data provided", { status: 400 });
  }
  const tutor = await prisma.tutor.findUnique({
    where: {
      id: (await params).tutorId,
      userId,
    },
  });
  if (!tutor) {
    return new Response("Tutorial not found", { status: 404 });
  }
  await prisma.tutor.update({
    where: {
      id: tutor.id,
    },
    data: {
      videoUrl,
    },
  });
  return new Response("Success", { status: 200 });
}

