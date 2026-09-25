import { requirePlatformUser } from "@/lib/platform-auth";
import { getAdminForUser, getCourseForAdmin, resolveCourseContext } from "@/lib/platform-ownership";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requirePlatformUser(req);
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const admin = await getAdminForUser(userId);
  if (!admin) return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });

  const { courseId } = await params;
  const course = await getCourseForAdmin(courseId, admin.id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const title =
    typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
      ? body.title.trim()
      : "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const lastCoursenoticeboard = await prisma.courseNoticeboard.findFirst({
    where: { courseId: course.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const coursenoticeboard = await prisma.courseNoticeboard.create({
    data: {
      title,
      courseId: course.id,
      userId,
      position: (lastCoursenoticeboard?.position ?? 0) + 1,
    },
  });

  return NextResponse.json(coursenoticeboard);
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const ctx = await resolveCourseContext(req, courseId);
  if ("error" in ctx) return ctx.error;

  const coursenoticeboards = await prisma.courseNoticeboard.findMany({
    where: { courseId: ctx.course.id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(coursenoticeboards);
}