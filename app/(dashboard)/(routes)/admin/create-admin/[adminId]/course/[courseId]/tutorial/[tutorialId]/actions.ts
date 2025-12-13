"use server";

import { prisma } from "@/lib/db";
import { Prisma, Tutor } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function onEditAction(courseId: string, tutorId: string) {
  try {
    console.log("onEditAction called with:", { courseId, tutorId });
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      console.error("Course not found:", { courseId });
      return { success: false, message: "Course not found" };
    }
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId, courseId },
    });
    if (!tutor) {
      console.error("Tutor not found:", { tutorId, courseId });
      return { success: false, message: "Tutorial not found" };
    }
    return { success: true, message: "Edit action triggered" };
  } catch (error) {
    console.error("Edit error:", error);
    return { success: false, message: "Failed to trigger edit action" };
  }
}

export async function createTutor(
  courseId: string,
  values: { title: string }
): Promise<{ success: boolean; message: string; data?: Tutor }> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      console.error("Course not found:", { courseId });
      return { success: false, message: "Course not found" };
    }
    const tutor = await prisma.tutor.create({
      data: {
        title: values.title,
        userId: course.userId,
        courseId,
        adminId: course.adminId,
        position: 0,
        isPublished: false,
      },
    });
    revalidatePath(`/admin/create-admin/${course.adminId}/course/${courseId}`);
    console.log(
      `Revalidated path: /admin/create-admin/${course.adminId}/course/${courseId}`
    );
    return {
      success: true,
      message: `Tutorial "${tutor.title}" created successfully`,
      data: tutor,
    };
  } catch (error) {
    console.error("Create tutor error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "A tutorial with this title already exists",
        };
      }
    }
    return { success: false, message: "Failed to create tutorial" };
  }
}
