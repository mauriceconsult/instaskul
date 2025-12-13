import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminIdSearchInput } from "./_components/adminId-search-input";
import { getCourses } from "@/actions/get-courses";
import { Admins } from "./_components/admins";
import { CourseTutorList } from "../course/[courseId]/_components/course-tutor-list";

interface AdminSearchPageProps {
  searchParams: Promise<{
    title: string;
    adminId: string;
  }>
}

const AdminSearchPage = async ({
  searchParams
}: AdminSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/"); 
  }
  const admins = await prisma.admin.findMany({
    orderBy: {
      title: "asc",
    },
  });
  const courses = await getCourses({
    userId,
    ...await searchParams
  }) 
  return (
    <>
      <div className="px-6 pt-4 md:hidden md:mb-0 block">
        <AdminIdSearchInput />
      </div>
      <div className="p-6">
        <Admins items={admins} />
        <CourseTutorList items={courses} />
      </div>
    </>
  );
};

export default AdminSearchPage;
