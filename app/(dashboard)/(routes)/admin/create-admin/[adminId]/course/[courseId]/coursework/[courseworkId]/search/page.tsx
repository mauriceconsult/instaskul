import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCourseworks } from "@/actions/get-courseworks";
import { CourseworksList } from "./_components/courseworks-list";
import { Courses } from "../../../search/_components/courses";
import { CourseworkSearchInput } from "./_components/coursework-search-input";

interface CourseworkSearchPageProps {
  searchParams: Promise<{
    title: string;
    courseId: string;
    courseworkId: string;
  }>
}

const CourseworkSearchPage = async ({
  searchParams
}: CourseworkSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/"); 
  }
  const courses = await prisma.course.findMany({
    orderBy: {
      title: "asc",
    },
  });
  const courseworks = await getCourseworks({
    userId,
    ...await searchParams
  }) 
  return (
    <>
      <div className="px-6 pt-4 md:hidden md:mb-0 block">
        <CourseworkSearchInput />
      </div>
      <div className="p-6">
        <Courses items={courses} />
        <CourseworksList items={courseworks} />
      </div>
    </>
  );
};

export default CourseworkSearchPage;
