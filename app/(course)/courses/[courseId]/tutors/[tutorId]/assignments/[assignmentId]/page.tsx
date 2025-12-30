import { SubmitAssignment } from "@/components/student/submit-assignment";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{
    courseId: string;
    tutorialId: string;
    assignmentId: string;
  }>;
}

export default async function StudentAssignmentPage({ params }: PageProps) {
  const { assignmentId } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { title: true, description: true },
  });

  if (!assignment) return <div>Assignment not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
      {assignment.description && (
        <p className="text-gray-600 mb-6">{assignment.description}</p>
      )}
      <SubmitAssignment assignmentId={assignmentId} />
    </div>
  );
}