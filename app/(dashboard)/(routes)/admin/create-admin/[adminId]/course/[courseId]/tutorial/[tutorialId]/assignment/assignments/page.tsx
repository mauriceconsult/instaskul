import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataTable } from "./_components/assignment-data-table";
import { columns } from "./_components/assignment-columns";

interface AssignmentsPageProps {
  params: Promise<{
    adminId: string;
    courseId: string;
    tutorId: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentsPage({ params }: AssignmentsPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const { adminId, courseId, tutorId } = await params;

  const assignments = await prisma.assignment.findMany({
    where: {
      tutorId,
      userId,
    },
    select: {
      id: true,
      title: true,
      tutorId: true,     
      description: true,     
      position: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-6">Assignments</h1>
      <DataTable
        columns={columns}
        data={assignments}
        tutorId={ tutorId}
        courseId={courseId}
        adminId={adminId}
      />
    </div>
  );
}
