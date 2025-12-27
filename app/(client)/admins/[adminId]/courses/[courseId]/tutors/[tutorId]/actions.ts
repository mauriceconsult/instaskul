"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function markTutorialCompleted({
  userId,
  tutorialId,
  courseId,
}: {
  userId: string | null;
  tutorialId: string;
  courseId: string;
}) {
  if (!userId) {
    console.error("[markTutorialCompleted] Error: No authenticated user");
    throw new Error("Unauthorized");
  }

  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId || currentUserId !== userId) {
      console.error("[markTutorialCompleted] Error: Unauthorized");
      throw new Error("Unauthorized");
    }

    const tuition = await prisma.tuition.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!tuition) {
      console.error("[markTutorialCompleted] Error: User not enrolled");
      throw new Error("You must enroll in the course to mark progress");
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_tutorId: { userId, tutorId: "" },
      },
      update: {
        isCompleted: true,
      },
      create: {
        userId,       
        isCompleted: true,
      },
    });

    console.log("[markTutorialCompleted] Progress updated:", {
      userId,
      tutorialId,
    });
    return { success: true, progress };
  } catch (error) {
    console.error("[markTutorialCompleted] Error:", {
      message: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to mark tutorial as completed");
  }
}
