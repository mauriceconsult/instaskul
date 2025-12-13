import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "./_components/tutor-data-table";
import { columns } from "./_components/tutor-columns";


interface TutorialsPageProps {
  params: Promise<{
    adminId: string;
    courseId: string;
    tutorId: string;
  }>;
}

export default async function TutorialsPage({ params }: TutorialsPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const { adminId, courseId } = await params;

  const tutors = await prisma.tutor.findMany({
    where: {
      courseId,
      userId,
    },
    select: {
      id: true,
      title: true,
      adminId: true,
      courseId: true,
      description: true,
      videoUrl: true,      
      position: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-6">Tutorials</h1>
      <DataTable columns={columns} data={tutors} courseId={courseId} adminId={adminId} />
    </div>
  );
};
