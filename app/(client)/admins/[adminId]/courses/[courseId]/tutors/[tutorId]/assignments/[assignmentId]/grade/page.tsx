import { GradeSubmissions } from "@/components/teacher/grade-submission";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    courseId: string;
    tutorialId: string;
    assignmentId: string;
  }>;
}

export default async function TeacherGradePage({ params }: PageProps) {
  const { assignmentId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  // Optional: Check if user is teacher of this course
  const course = await prisma.course.findUnique({
    where: { id: (await params).courseId },
    select: { adminId: true },
  });

  if (course?.adminId !== userId) {
    return <div>Access denied.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Grade Submissions</h1>
      <GradeSubmissions assignmentId={assignmentId} />
    </div>
  );
}