import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/course-data-table";
import { columns } from "./_components/course-columns";


const CoursesPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const courses = await prisma.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};
export default CoursesPage;
