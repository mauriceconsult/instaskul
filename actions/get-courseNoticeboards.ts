// actions/get-course-noticeboards.ts
import { prisma } from "@/lib/db";
import { CourseNoticeboard, Course } from "@prisma/client";

export type CourseNoticeboardWithCourse = CourseNoticeboard & {
  course: (Course & {
    courseNoticeboards: CourseNoticeboard[];
  }) | null;  // ← Allow null
};

export type GetCourseNoticeboardsParams = {
  title?: string;
  courseNoticeboardId?: string;
  courseId?: string;
  adminId?: string;
  userId?: string;
};

export const getCourseNoticeboards = async (
  params: GetCourseNoticeboardsParams
): Promise<CourseNoticeboardWithCourse[]> => {
  try {
    const {
      title,
      courseNoticeboardId,
      courseId,
      adminId,
    } = params;

    const courseNoticeboards = await prisma.courseNoticeboard.findMany({
      where: {
        isPublished: true,
        title: title
          ? { contains: title, mode: "insensitive" }
          : undefined,
        id: courseNoticeboardId,
        courseId,
        course: adminId ? { adminId } : undefined,
      },
      include: {
        course: {
          include: {
            courseNoticeboards: {
              where: { isPublished: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courseNoticeboards;
  } catch (error) {
    console.error("[GET_COURSE_NOTICEBOARDS]", error);
    return [];
  }
};