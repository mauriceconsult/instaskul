import { requirePlatformUser } from "@/lib/platform-auth";
import { getAdminForUser, getCourseForAdmin, getTutorialForCourse } from "@/lib/platform-ownership";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; tutorialId: string }> }
) {
  const userId = await requirePlatformUser(req);
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const admin = await getAdminForUser(userId);
  if (!admin) return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });

  const { courseId, tutorialId } = await params;
  const course = await getCourseForAdmin(courseId, admin.id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const tutorial = await getTutorialForCourse(tutorialId, course.id);
  if (!tutorial) return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });

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

  const lastAssignment = await prisma.assignment.findFirst({
    where: { tutorId: tutorial.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const assignment = await prisma.assignment.create({
    data: {
      title,
      tutorId: tutorial.id,
      userId,
      position: (lastAssignment?.position ?? 0) + 1,
    },
  });

  return NextResponse.json(assignment);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; tutorialId: string }> }
) {
  const userId = await requirePlatformUser(req);
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const admin = await getAdminForUser(userId);
  if (!admin) return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });

  const { courseId, tutorialId } = await params;
  const course = await getCourseForAdmin(courseId, admin.id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const tutorial = await getTutorialForCourse(tutorialId, course.id);
  if (!tutorial) return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });

  const assignments = await prisma.assignment.findMany({
    where: { tutorId: tutorial.id },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(assignments);
}

