import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Courses } from "../../../search/_components/courses";
import { getCourseNoticeboards } from "@/actions/get-courseNoticeboards";
import { CourseCourseNoticeboardSearchInput } from "./_components/course-coursenoticeboard-search-input";
import { CourseCourseNoticeboardsList } from "./_components/course-coursenoticeboard-list";



interface CourseNoticeboardSearchPageProps {
  searchParams: Promise<{
    title: string;
    courseId: string;
    courseCoursenoticeboardId: string;
  }>
}

const CourseNoticeboardSearchPage = async ({
  searchParams
}: CourseNoticeboardSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/"); 
  }
  const courses = await prisma.course.findMany({
    orderBy: {
      title: "asc",
    },
  });
  const courseCoursenoticeboards = await getCourseNoticeboards({
    userId,
    ...await searchParams
  }) 
  return (
    <>
      <div className="px-6 pt-4 md:hidden md:mb-0 block">
        <CourseCourseNoticeboardSearchInput />
      </div>
      <div className="p-6">
        <Courses items={courses} />
        <CourseCourseNoticeboardsList items={courseCoursenoticeboards} />
      </div>
    </>
  );
};

export default CourseNoticeboardSearchPage;
