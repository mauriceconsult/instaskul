import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTutors } from "@/actions/get-tutors";
import { TutorSearchInput } from "@/components/search-input/tutor-search-input";
import { Courses } from "../../../search/_components/courses";
import { TutorsList } from "@/components/lists/tutors-list";


interface TutorSearchPageProps {
  searchParams: Promise<{
    title: string;
    courseId: string;
  }>;
}

const TutorSearchPage = async ({ searchParams }: TutorSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { title, courseId } = await searchParams;

  // Fetch courses for filter pills (only those with published courses)
  const courses = await prisma.course.findMany({
    where: {
      tutors: {
        some: { isPublished: true },
      },
    },
    orderBy: { title: "asc" },
  });

  // Fetch tutors based on search/filter
  const tutors = await getTutors({
    userId,
    title,
    courseId,
  });

  return (
    <>
      {/* Mobile search */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <TutorSearchInput />
      </div>

      <div className="p-6 space-y-8">
        {/* Course filter buttons */}
        {courses.length > 0 && <Courses items={courses} />}

        {/* Noticeboard grid */}
        <TutorsList items={tutors} />
      </div>
    </>
  );
};

export default TutorSearchPage;