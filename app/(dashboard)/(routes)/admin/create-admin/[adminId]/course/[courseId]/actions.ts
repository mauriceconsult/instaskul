"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function updateCourse( 
  courseId: string,
  values: { description?: string }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return { success: false, message: "Course not found" };
    }
    if (values.description && values.description.length > 5000) {
      return { success: false, message: "Description exceeds 5000 characters" };
    }   
    await prisma.course.update({
      where: { id: courseId },
      data: { description: values.description || "" },
    });
    return {
      success: true,
      message: "Course description updated successfully",
    };
  } catch (error) {
    console.error("Update admin error:", error);
    return { success: false, message: "Failed to update admin description" };
  }
}

export async function onReorderAction(
  adminId: string,
  updateData: { id: string; position: number }[]
) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Course not found" };
    }
    await prisma.$transaction(
      updateData.map((update) =>
        prisma.course.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );
    return { success: true, message: "Courses reordered successfully" };
  } catch (error) {
    console.error("Reorder error:", error);
    return { success: false, message: "Failed to reorder courses" };
  }
}

export async function onEditAction(adminId: string, id: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Course not found" };
    }
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return { success: false, message: "Course not found" };
    }
    return { success: true, message: "Edit action triggered" };
  } catch (error) {
    console.error("Edit error:", error);
    return { success: false, message: "Failed to trigger edit action" };
  }
}

export async function createCourse(
  adminId: string,
  values: { title: string; description?: string }
) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Course not found" };
    }
    if (values.description && values.description.length > 5000) {
      return { success: false, message: "Description exceeds 5000 characters" };
    }

    const course = await prisma.course.create({
      data: {
        title: values.title,
        description: values.description || "",
        userId: admin.userId,
        adminId,
        position: 0,
        isPublished: false,
      },
    });
    return {
      success: true,
      message: `Course "${course.title}" created successfully`,
    };
  } catch (error) {
    console.error("Create course error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "A course with this title already exists",
        };
      }
    }
    return { success: false, message: "Failed to create course" };
  }
}
