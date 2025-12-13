"use server";

import { prisma } from "@/lib/db";
import { Prisma, Noticeboard } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function onEditAction(adminId: string, id: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }
    const noticeboard = await prisma.noticeboard.findUnique({ where: { id } });
    if (!noticeboard) {
      return { success: false, message: "Noticeboard not found" };
    }
    return { success: true, message: "Edit action triggered" };
  } catch (error) {
    console.error("Edit error:", error);
    return { success: false, message: "Failed to trigger edit action" };
  }
}

export async function createNoticeboard(
  adminId: string,
  values: { title: string; description?: string }
): Promise<{ success: boolean; message: string; data?: Noticeboard }> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }
    const noticeboard = await prisma.noticeboard.create({
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
      message: `Noticeboard "${noticeboard.title}" created successfully`,
      data: noticeboard,
    };
  } catch (error) {
    console.error("Create noticeboard error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "A noticeboard with this title already exists",
        };
      }
    }
    return { success: false, message: "Failed to create noticeboard" };
  }
}

export async function updateNoticeboard(
  noticeboardId: string,
  values: { description?: string }
): Promise<{ success: boolean; message: string; data?: Noticeboard }> {
  try {
    const noticeboard = await prisma.noticeboard.findUnique({
      where: { id: noticeboardId },
    });
    if (!noticeboard) {
      return { success: false, message: "Noticeboard not found" };
    }
    if (values.description && values.description.length > 5000) {
      return { success: false, message: "Description exceeds 5000 characters" };
    }

    const updatedNoticeboard = await prisma.noticeboard.update({
      where: { id: noticeboardId },
      data: { description: values.description || "" },
    });
    revalidatePath(`/admin/create-admin/${noticeboard.adminId}`);
    return {
      success: true,
      message: `Noticeboard "${updatedNoticeboard.title}" updated successfully`,
      data: updatedNoticeboard,
    };
  } catch (error) {
    console.error("Update noticeboard error:", error);
    return { success: false, message: "Failed to update noticeboard" };
  }
}
