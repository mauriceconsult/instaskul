import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "./_components/course-data-table";
import { columns } from "./_components/course-columns";

interface CoursesPageProps {
  params: Promise<{
    adminId: string;
  }>;
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const { adminId } = await params;

  const courses = await prisma.course.findMany({
    where: {
      adminId,
      userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      amount: true,
      adminId: true,
      position: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-6">Courses</h1>
      <DataTable columns={columns} data={courses} adminId={adminId} />
    </div>
  );
};
