"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createCoursework(
  courseId: string,
  data: { title: string }
) {
  try {
    if (!courseId || !data.title) {
      return { success: false, message: "Invalid course ID or title" };
    }

    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, message: "Course not found" };
    }

    const coursework = await prisma.coursework.create({
      data: {
        title: data.title,
        courseId,
        userId,
        position: (await prisma.coursework.count({ where: { courseId } })) + 1,
      },
    });

    revalidatePath(`/admin/create-admin/${course.adminId}/course/${courseId}`);
    console.log("Revalidated path for createCoursework:", {
      courseId,
      courseworkId: coursework.id,
    });

    return {
      success: true,
      message: `Coursework "${coursework.title}" created successfully`,
      coursework,
    };
  } catch (error) {
    console.error("Create coursework error:", error);
    return { success: false, message: "Failed to create coursework" };
  }
}

export async function onEditCourseworkAction(
  courseId: string,
  courseworkId: string
) {
  try {
    if (!courseId || !courseworkId) {
      return { success: false, message: "Invalid course or coursework ID" };
    }

    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const coursework = await prisma.coursework.findUnique({
      where: { id: courseworkId },
      include: { course: true },
    });

    if (!coursework || coursework.courseId !== courseId) {
      return {
        success: false,
        message: "Coursework not found or unauthorized",
      };
    }

    if (!coursework.course) {
      console.error("Coursework has no associated course:", {
        courseworkId,
        courseId,
      });
      return {
        success: false,
        message: "Coursework is not associated with a valid course",
      };
    }

    revalidatePath(
      `/admin/create-admin/${coursework.course.adminId}/course/${courseId}/coursework/${courseworkId}`
    );
    console.log("Revalidated path for editCoursework:", {
      courseId,
      courseworkId,
    });

    return { success: true, message: "Coursework edit authorized" };
  } catch (error) {
    console.error("Edit coursework error:", error);
    return { success: false, message: "Failed to validate coursework" };
  }
}

export async function createCourseNoticeboard(
  courseId: string,
  data: { title: string }
) {
  try {
    if (!courseId || !data.title) {
      return { success: false, message: "Invalid course ID or title" };
    }

    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, message: "Course not found" };
    }

    const noticeboard = await prisma.courseNoticeboard.create({
      data: {
        title: data.title,
        courseId,
        userId,
        position:
          (await prisma.courseNoticeboard.count({ where: { courseId } })) + 1,
      },
    });

    revalidatePath(`/admin/create-admin/${course.adminId}/course/${courseId}`);
    console.log("Revalidated path for createCourseNoticeboard:", {
      courseId,
      noticeboardId: noticeboard.id,
    });

    return {
      success: true,
      message: `Noticeboard "${noticeboard.title}" created successfully`,
      noticeboard,
    };
  } catch (error) {
    console.error("Create noticeboard error:", error);
    return { success: false, message: "Failed to create noticeboard" };
  }
}

export async function onEditCourseNoticeboardAction(
  courseId: string,
  courseNoticeboardId: string
) {
  try {
    if (!courseId || !courseNoticeboardId) {
      return { success: false, message: "Invalid course or noticeboard ID" };
    }

    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const noticeboard = await prisma.courseNoticeboard.findUnique({
      where: { id: courseNoticeboardId },
      include: { course: true },
    });

    if (!noticeboard || noticeboard.courseId !== courseId) {
      return {
        success: false,
        message: "Noticeboard not found or unauthorized",
      };
    }

    if (!noticeboard.course) {
      console.error("Noticeboard has no associated course:", {
        courseNoticeboardId,
        courseId,
      });
      return {
        success: false,
        message: "Noticeboard is not associated with a valid course",
      };
    }

    revalidatePath(
      `/admin/create-admin/${noticeboard.course.adminId}/course/${courseId}/noticeboard/${courseNoticeboardId}`
    );
    console.log("Revalidated path for editCourseNoticeboard:", {
      courseId,
      courseNoticeboardId,
    });

    return { success: true, message: "Noticeboard edit authorized" };
  } catch (error) {
    console.error("Edit noticeboard error:", error);
    return { success: false, message: "Failed to validate noticeboard" };
  }
}

export async function onReorderCourseworkAction(
  courseId: string,
  courseworkIds: string[]
) {
  try {
    if (!courseId || !courseworkIds || !Array.isArray(courseworkIds)) {
      return { success: false, message: "Invalid course ID or coursework IDs" };
    }

    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const courseworks = await prisma.coursework.findMany({
      where: {
        courseId,
        id: { in: courseworkIds },
      },
    });

    if (courseworks.length !== courseworkIds.length) {
      return {
        success: false,
        message: "Some courseworks not found or unauthorized",
      };
    }

    await prisma.$transaction(
      courseworkIds.map((id, index) =>
        prisma.coursework.update({
          where: { id },
          data: { position: index + 1 },
        })
      )
    );

    revalidatePath(
      `/admin/create-admin/${courseworks[0].courseId}/course/${courseId}`
    );
    console.log("Revalidated path for reorderCoursework:", { courseId });

    return { success: true, message: "Courseworks reordered successfully" };
  } catch (error) {
    console.error("Reorder coursework error:", error);
    return { success: false, message: "Failed to reorder courseworks" };
  }
}

export async function onReorderCourseNoticeboardAction(
  courseId: string,
  noticeboardIds: string[]
) {
  try {
    if (!courseId || !noticeboardIds || !Array.isArray(noticeboardIds)) {
      return {
        success: false,
        message: "Invalid course ID or noticeboard IDs",
      };
    }

    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const noticeboards = await prisma.courseNoticeboard.findMany({
      where: {
        courseId,
        id: { in: noticeboardIds },
      },
    });

    if (noticeboards.length !== noticeboardIds.length) {
      return {
        success: false,
        message: "Some noticeboards not found or unauthorized",
      };
    }

    await prisma.$transaction(
      noticeboardIds.map((id, index) =>
        prisma.courseNoticeboard.update({
          where: { id },
          data: { position: index + 1 },
        })
      )
    );

    revalidatePath(
      `/admin/create-admin/${noticeboards[0].courseId}/course/${courseId}`
    );
    console.log("Revalidated path for reorderCourseNoticeboard:", { courseId });

    return { success: true, message: "Noticeboards reordered successfully" };
  } catch (error) {
    console.error("Reorder noticeboard error:", error);
    return { success: false, message: "Failed to reorder noticeboards" };
  }
}
