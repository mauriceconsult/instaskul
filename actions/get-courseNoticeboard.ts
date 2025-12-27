import { prisma } from "@/lib/db";
import { Attachment, Course, CourseNoticeboard } from "@prisma/client";

export type CourseNoticeboardDetail = {
  courseNoticeboard: CourseNoticeboard | null;
  course: Course | null;
  attachments: Attachment[];
  nextCourseNoticeboard: CourseNoticeboard | null;
};

interface GetCourseNoticeboardParams {
  userId: string;
  courseId: string;
  courseNoticeboardId: string;
}

export const getCourseNoticeboard = async ({
  userId,
  courseId,
  courseNoticeboardId,
}: GetCourseNoticeboardParams): Promise<CourseNoticeboardDetail> => {
  try {
    const [course, courseNoticeboard] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId, isPublished: true },
      }),
      prisma.courseNoticeboard.findUnique({
        where: { id: courseNoticeboardId, isPublished: true },
      }),
    ]);

    if (!course || !courseNoticeboard) {
      throw new Error("Course or Course Noticeboard not found");
    }

    const [attachments, nextCourseNoticeboard] = await Promise.all([
      userId
        ? prisma.attachment.findMany({
            where: { courseId },
            orderBy: { createdAt: "desc" },
          })
        : [],
      prisma.courseNoticeboard.findFirst({
        where: {
          courseId,
          isPublished: true,
          position: { gt: courseNoticeboard.position ?? 0 },
        },
        orderBy: { position: "asc" },
      }),
    ]);

    return {
      courseNoticeboard,
      course,
      attachments,
      nextCourseNoticeboard,
    };
  } catch (error) {
    console.error("[GET_COURSE_NOTICEBOARD]", error);
    return {
      courseNoticeboard: null,
      course: null,
      attachments: [],
      nextCourseNoticeboard: null,
    };
  }
};