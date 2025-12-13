"use server";

import { prisma } from "@/lib/db";
import { Prisma, Course } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateAdmin(
  adminId: string,
  values: { description?: string }
) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }
    if (values.description && values.description.length > 5000) {
      return { success: false, message: "Description exceeds 5000 characters" };
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: { description: values.description || "" },
    });
    revalidatePath(`/admin/create-admin/${adminId}`);
    return {
      success: true,
      message: "Admin description updated successfully",
    };
  } catch (error) {
    console.error("Update admin error:", error);
    return { success: false, message: "Failed to update admin description" };
  }
}

export async function onEditAction(adminId: string, id: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Admin not found" };
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
): Promise<{ success: boolean; message: string; data?: Course }> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Admin not found" };
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
    revalidatePath(`/admin/create-admin/${adminId}`);
    return {
      success: true,
      message: `Course "${course.title}" created successfully`,
      data: course,
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
