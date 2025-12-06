import { prisma } from "@/lib/db";
import { Admin, Course, UserProgress } from "@prisma/client";

type AdminWithProgress = Admin & { userProgress: UserProgress[] };
type CourseWithProgress = Course & { userProgress: UserProgress[] };

export async function getDashboardData(): Promise<{
  adminsInProgress: AdminWithProgress[];
  adminsCompleted: AdminWithProgress[];
  coursesInProgress: CourseWithProgress[];
  completedCourses: CourseWithProgress[];
}> {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  try {
      const admins = await prisma.admin.findMany({
      where: {
        isPublished: true,
      },
      include: {
        userProgress: true,
      },
    });
    console.log("Admins fetched:", admins);
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        userProgress: true,
      },
    });
    console.log("Courses fetched:", courses);

    const adminsInProgress = admins.filter((admin) =>
      admin.userProgress.some((progress) => !progress.isCompleted)
    );
    const adminsCompleted = admins.filter((admin) =>
      admin.userProgress.every((progress) => progress.isCompleted)
    );
    const coursesInProgress = courses.filter((course) =>
      course.userProgress.some((progress) => !progress.isCompleted)
    );
    const completedCourses = courses.filter((course) =>
      course.userProgress.every((progress) => progress.isCompleted)
    );

    console.log("Courses in progress:", coursesInProgress);
    console.log("Completed courses:", completedCourses);
    console.log("Admins in progress:", adminsInProgress);
    console.log("Completed admins:", adminsCompleted);

    return { adminsInProgress, adminsCompleted, coursesInProgress, completedCourses };
  } catch (error) {
    console.error("Database query failed:", error);
    return { adminsInProgress: [], adminsCompleted: [], coursesInProgress: [], completedCourses: [] };
  }
}