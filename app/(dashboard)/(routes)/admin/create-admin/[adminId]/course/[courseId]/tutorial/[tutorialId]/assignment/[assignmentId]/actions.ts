"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateAssignment(
  assignmentId: string,
  values: { description?: string },
  adminId: string,
  courseId: string,
  tutorialId: string
) {
  try {
    console.log(
      "updateAssignment - assignmentId:",
      assignmentId,
      "values:",
      values,
      "params:",
      { adminId, courseId, tutorialId }
    );
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId, tutorId: tutorialId },
    });
    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }
    if (values.description && values.description.length > 5000) {
      return { success: false, message: "Description exceeds 5000 characters" };
    }
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { description: values.description || "" },
    });
    revalidatePath(
      `/admin/create-admin/${adminId}/course/${courseId}/tutorial/${tutorialId}`
    );
    revalidateTag(`assignments-${tutorialId}`);
    console.log("Revalidated cache for:", { tutorialId, assignmentId });
    return {
      success: true,
      message: "Assignment description updated successfully",
      data: updatedAssignment,
    };
  } catch (error) {
    console.error("Update assignment error:", error);
    return {
      success: false,
      message: "Failed to update assignment description",
    };
  }
}

export async function onEditAction(
  tutorId: string,
  assignmentId: string,
  adminId: string,
  courseId: string
) {
  try {
    console.log(
      "onEditAction - tutorId:",
      tutorId,
      "assignmentId:",
      assignmentId,
      "params:",
      { adminId, courseId }
    );
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId, courseId, adminId },
    });
    if (!tutor) {
      return { success: false, message: "Tutor not found" };
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId, tutorId },
    });
    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }
    revalidatePath(
      `/admin/create-admin/${adminId}/course/${courseId}/tutorial/${tutorId}/assignment/${assignmentId}`
    );
    revalidateTag(`assignments-${tutorId}`);
    console.log("Revalidated cache for edit:", { tutorId, assignmentId });
    return { success: true, message: "Edit action triggered" };
  } catch (error) {
    console.error("Edit error:", error);
    return { success: false, message: "Failed to trigger edit action" };
  }
}

export async function createAssignment(
  tutorId: string,
  values: { title: string; description?: string },
  adminId: string,
  courseId: string
) {
  try {
    console.log(
      "createAssignment - tutorId:",
      tutorId,
      "values:",
      values,
      "params:",
      { adminId, courseId }
    );
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId, courseId, adminId },
    });
    if (!tutor) {
      return { success: false, message: "Tutor not found" };
    }
    if (values.description && values.description.length > 5000) {
      return { success: false, message: "Description exceeds 5000 characters" };
    }
    const assignment = await prisma.assignment.create({
      data: {
        title: values.title,
        description: values.description || "",
        userId: tutor.userId || "",
        tutorId,
        isPublished: false,
      },
    });
    revalidatePath(
      `/admin/create-admin/${adminId}/course/${courseId}/tutorial/${tutorId}`
    );
    revalidateTag(`assignments-${tutorId}`);
    console.log("Revalidated cache for create:", {
      tutorId,
      assignmentId: assignment.id,
    });
    return {
      success: true,
      message: `Assignment "${assignment.title}" created successfully`,
      data: assignment,
    };
  } catch (error) {
    console.error("Create assignment error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "An assignment with this title already exists",
        };
      }
    }
    return { success: false, message: "Failed to create assignment" };
  }
}
