import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCourseworks } from "@/actions/get-courseworks";
import { Courses } from "../../../search/_components/courses";
import { CourseworkSearchInput } from "@/components/search-input/coursework-search-input";
import { CourseworksList } from "@/components/lists/courseworks-list";


interface CourseworkSearchPageProps {
  searchParams: Promise<{
    title: string;
    courseId: string;
  }>;
}

const CourseworkSearchPage = async ({ searchParams }: CourseworkSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { title, courseId } = await searchParams;

  // Fetch courses for filter pills (only those with published courses)
  const courses = await prisma.course.findMany({
    where: {
      courseworks: {
        some: { isPublished: true },
      },
    },
    orderBy: { title: "asc" },
  });

  // Fetch courseworks based on search/filter
  const courseworks = await getCourseworks({
    userId,
    title,
    courseId,
  });

  return (
    <>
      {/* Mobile search */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <CourseworkSearchInput />
      </div>

      <div className="p-6 space-y-8">
        {/* Course filter buttons */}
        {courses.length > 0 && <Courses items={courses} />}

        {/* Noticeboard grid */}
        <CourseworksList items={courseworks} />
      </div>
    </>
  );
};

export default CourseworkSearchPage;