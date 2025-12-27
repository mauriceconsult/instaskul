import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCourseNoticeboards } from "@/actions/get-courseNoticeboards";
import { Courses } from "../../../search/_components/courses";
import { CourseNoticeboardSearchInput } from "@/components/search-input/coursenoticeboard-search-input";
import { CourseNoticeboardsList } from "@/components/lists/coursenoticeboards-list";



interface CourseNoticeboardSearchPageProps {
  searchParams: Promise<{
    title: string;
    courseId: string;
  }>;
}

const CourseNoticeboardSearchPage = async ({ searchParams }: CourseNoticeboardSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { title, courseId } = await searchParams;

  // Fetch courses for filter pills (only those with published courses)
  const courses = await prisma.course.findMany({
    where: {
      courseNoticeboards: {
        some: { isPublished: true },
      },
    },
    orderBy: { title: "asc" },
  });

  // Fetch coursenoticeboards based on search/filter
  const coursenoticeboards = await getCourseNoticeboards({
    userId,
    title,
    courseId,
  });

  return (
    <>
      {/* Mobile search */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <CourseNoticeboardSearchInput />
      </div>

      <div className="p-6 space-y-8">
        {/* Course filter buttons */}
        {courses.length > 0 && <Courses items={courses} />}

        {/* Noticeboard grid */}
        <CourseNoticeboardsList items={coursenoticeboards} />
      </div>
    </>
  );
};

export default CourseNoticeboardSearchPage;