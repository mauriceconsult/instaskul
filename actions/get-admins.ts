import { prisma } from "@/lib/db";
import { Admin, School, Course } from "@prisma/client";
import { getCourseProgress } from "./get-course-progress";

export type AdminsWithSchool = Admin & {
  school: School | null;
  courses: Course[];
  noticeboards: { id: string }[];
  progress: number | null;
};

export type GetAdmins = {
  userId: string;
  title?: string;
  schoolId?: string;
};

export const getAdmins = async ({
  userId,
  title,
  schoolId,
}: GetAdmins): Promise<AdminsWithSchool[]> => {
  try {
    const admins = await prisma.admin.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
          mode: "insensitive",
        },
        schoolId,
      },
      include: {
        school: true,
        courses: true,
        noticeboards: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const adminWithSchool: AdminsWithSchool[] = await Promise.all(
      admins.map(async (admin) => {
        if (admin.courses.length === 0) {
          return {
            ...admin,
            progress: null,
          };
        }
        const progress = await getCourseProgress(userId, admin.id);
        return {
          ...admin,
          progress,
        };
      })
    );

    return adminWithSchool;
  } catch (error) {
    console.log("[GET_ADMINS]", error);
    return [];
  }
};
