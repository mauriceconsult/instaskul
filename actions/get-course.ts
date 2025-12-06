import { prisma } from "@/lib/db";
import { Attachment, Course } from "@prisma/client";

interface GetCourseProps {
  userId: string;
  adminId: string;
  courseId: string;
}
export const getCourse = async ({
  userId,
  adminId,
  courseId,
}: GetCourseProps) => {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
    });
    if (!adminId || !course) {
      throw new Error("Admin or Course not found");
    }
    let attachments: Attachment[] = [];
    let nextCourse: Course | null = null;
    if (userId) {
      attachments = await prisma.attachment.findMany({
        where: {
          courseId: courseId,
        },
      });
      nextCourse = await prisma.course.findFirst({
        where: {
          adminId: adminId,
          isPublished: true,
          position: {
            gt: course?.position ?? 0,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }
    return {
      course,
      attachments,
      nextCourse,
    };
  } catch (error) {
    console.log("[GET_COURSE_ERROR]", error);
    return {
      course: null,      
      attachments: [],
      nextCourse: null,
    };
  }
};
