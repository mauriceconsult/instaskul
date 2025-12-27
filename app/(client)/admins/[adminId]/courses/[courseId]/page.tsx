import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    return <div className="p-6">Please sign in to view this course.</div>;
  }

  const tutorials = await prisma.tutor.findMany({
    where: { courseId, isPublished: true },
    include: {
      assignments: {
        where: { isPublished: true },
        include: {
          assignmentSubmissions: {
            where: { userId: currentUserId },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { position: "asc" },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Course Content</h1>

      {tutorials.length === 0 ? (
        <p className="text-gray-500">No published tutorials yet.</p>
      ) : (
        <div className="space-y-10">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="border-b pb-8 last:border-0">
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                {tutorial.title}
              </h2>

              {tutorial.assignments.length === 0 ? (
                <p className="text-gray-500">No assignments available.</p>
              ) : (
                <div className="space-y-3">
                  {tutorial.assignments.map((assignment) => {
                    const isSubmitted = assignment.assignmentSubmissions.length > 0;
                    return (
                      <div
                        key={assignment.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div>
                          <h3 className="font-medium text-lg">{assignment.title}</h3>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                        <div>
                          {isSubmitted ? (
                            <span className="text-green-600 font-semibold text-sm">
                              Submitted
                            </span>
                          ) : (
                            <Link
                              href={`/courses/${courseId}/tutorials/${tutorial.id}/assignments/${assignment.id}`}
                              className="text-blue-600 hover:underline font-medium text-sm"
                            >
                              Submit Now
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}