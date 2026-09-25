// lib/platform-ownership.ts
import { prisma } from "@/lib/db";
import { requirePlatformUser } from "./platform-auth";
import { NextResponse } from "next/server";

export async function getAdminForUser(userId: string) {
  return prisma.admin.findFirst({ where: { userId } });
}

export async function getCourseForAdmin(courseId: string, adminId: string) {
  return prisma.course.findUnique({ where: { id: courseId, adminId } });
}

export async function getTutorialForCourse(tutorialId: string, courseId: string) {
  return prisma.tutor.findUnique({ where: { id: tutorialId, courseId } });
}

// lib/platform-ownership.ts — add this
export async function resolveTutorialContext(req: Request, courseId: string, tutorialId: string) {
  const userId = await requirePlatformUser(req);
  if (!userId) return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };

  const admin = await getAdminForUser(userId);
  if (!admin) return { error: NextResponse.json({ error: "No admin account for this user" }, { status: 404 }) };

  const course = await getCourseForAdmin(courseId, admin.id);
  if (!course) return { error: NextResponse.json({ error: "Course not found" }, { status: 404 }) };

  const tutorial = await getTutorialForCourse(tutorialId, course.id);
  if (!tutorial) return { error: NextResponse.json({ error: "Tutorial not found" }, { status: 404 }) };

  return { userId, admin, course, tutorial };
}

// lib/platform-ownership.ts — add this
export async function resolveCourseContext(req: Request, courseId: string) {
  const userId = await requirePlatformUser(req);
  if (!userId) return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };

  const admin = await getAdminForUser(userId);
  if (!admin) return { error: NextResponse.json({ error: "No admin account for this user" }, { status: 404 }) };

  const course = await getCourseForAdmin(courseId, admin.id);
  if (!course) return { error: NextResponse.json({ error: "Course not found" }, { status: 404 }) };

  return { userId, admin, course };
}