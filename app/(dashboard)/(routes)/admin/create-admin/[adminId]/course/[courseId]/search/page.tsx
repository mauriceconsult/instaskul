import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseSearchInput } from "./_components/course-search-input";
import { Admins } from "../../../search/_components/admins";
import { getAdmins } from "@/actions/get-admins";
import { CoursesList } from "./_components/courses-list";
import { getProgress } from "@/actions/get-progress";
import { Admin, Course } from "@prisma/client";

type CourseWithProgressWithAdmin = Course & {
  admin: Admin | null;
  tutors: { id: string }[];
  progress: number | null;
};

interface CourseSearchPageProps {
  searchParams: Promise<{
    title: string;
    courseId: string;
    adminId: string;
  }>;
}

const CourseSearchPage = async ({ searchParams }: CourseSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const { title, courseId, adminId } = await searchParams;

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      title: {
        contains: title,
        mode: "insensitive",
      },
      id: courseId || undefined,
      adminId: adminId || undefined,
    },
    include: {
      admin: true,
      tutors: {
        select: { id: true },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  const coursesWithProgress: CourseWithProgressWithAdmin[] = await Promise.all(
    courses.map(async (course) => {
      const progress = await getProgress(userId, course.id);
      return {
        ...course,
        admin: course.admin,
        tutors: course.tutors,
        progress,
      };
    })
  );

  const admins = await getAdmins({
    userId,
    title,
    // adminId,
  });

  return (
    <>
      <div className="px-6 pt-4 md:hidden md:mb-0 block">
        <CourseSearchInput />
      </div>
      <div className="p-6">
        <Admins items={admins} />
        <CoursesList items={coursesWithProgress} />
      </div>
    </>
  );
};

export default CourseSearchPage;
