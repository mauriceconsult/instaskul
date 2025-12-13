import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/course-coursenoticeboard-data-table";
import { columns } from "./_components/course-coursenoticeboard-columns";


const CourseNoticeboardsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const courseNoticeboards = await prisma.courseNoticeboard.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={courseNoticeboards} />
    </div>
  );
};
export default CourseNoticeboardsPage;
