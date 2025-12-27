import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCourses } from "@/actions/get-courses";
import { CourseSearchInput } from "@/components/search-input/course-search-input";
import { Admins } from "./_components/admins";
import { CoursesList } from "@/components/lists/courses-list";


interface CourseSearchPageProps {
  searchParams: Promise<{
    title: string;
    adminId: string;
  }>;
}

const CourseSearchPage = async ({ searchParams }: CourseSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { title, adminId } = await searchParams;

  // Fetch admins for filter pills (only those with published courses)
  const admins = await prisma.admin.findMany({
    where: {
      courses: {
        some: { isPublished: true },
      },
    },
    orderBy: { title: "asc" },
  });

  // Fetch courses based on search/filter
  const courses = await getCourses({
    userId,
    title,
    adminId,
  });

  return (
    <>
      {/* Mobile search */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <CourseSearchInput />
      </div>

      <div className="p-6 space-y-8">
        {/* Admin filter buttons */}
        {admins.length > 0 && <Admins items={admins} />}

        {/* Course grid */}
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default CourseSearchPage;