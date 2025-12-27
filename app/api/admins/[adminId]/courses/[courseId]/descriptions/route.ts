import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  const body = await request.json();
  const { description } = body;
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!description || description.length === 0) {
    return new Response("No data provided", { status: 400 });
  }
  const course = await prisma.course.findUnique({
    where: {
      id: (await params).courseId,
      userId,
    },
  });
  if (!course) {
    return new Response("Admin not found", { status: 404 });
  }
  await prisma.course.update({
    where: {
      id: course.id,
    },
    data: {
      description,
    },
  });
  return new Response("Success", { status: 200 });
}

