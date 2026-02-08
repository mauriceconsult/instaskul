// app/courses/[courseId]/assignments/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Lock, CheckCircle, Clock } from "lucide-react";

interface AllAssignmentsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function AllAssignmentsPage({ 
  params 
}: AllAssignmentsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      admin: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check enrollment
  const tuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const isEnrolled = tuition?.isPaid || false;
  const isCreator = course.admin?.userId === userId;
  const canAccess = isEnrolled || isCreator;

  // Fetch all assignments from all tutorials in this course
  const tutorialsWithAssignments = await prisma.tutor.findMany({
    where: {
      courseId,
      isPublished: true,
    },
    include: {
      assignments: {
        where: {
          isPublished: true,
        },
        include: {
          assignmentSubmissions: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  // Flatten all assignments with their tutorial context
  const allAssignments = tutorialsWithAssignments.flatMap((tutorial) =>
    tutorial.assignments.map((assignment) => ({
      ...assignment,
      tutorialId: tutorial.id,
      tutorialTitle: tutorial.title,
      tutorialIsFree: tutorial.isFree,
    }))
  );

  // Calculate stats
  const totalAssignments = allAssignments.length;
  const completedAssignments = allAssignments.filter(
    (a) => a.assignmentSubmissions.length > 0
  ).length;
  const gradedAssignments = allAssignments.filter(
    (a) => a.assignmentSubmissions[0]?.isGraded
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Link>

          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Assignments</h1>
              <p className="text-slate-600">{course.title}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-3xl font-bold mt-1">{totalAssignments}</p>
              </div>
              <CheckSquare className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Submitted</p>
                <p className="text-3xl font-bold mt-1">{completedAssignments}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Graded</p>
                <p className="text-3xl font-bold mt-1">{gradedAssignments}</p>
              </div>
              <Clock className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Enrollment Gate */}
        {!canAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <p className="text-yellow-800 mb-4">
              🔒 <strong>Enrollment Required:</strong> You need to enroll in this course to access assignments.
            </p>
            <Link
              href={`/courses/${courseId}/checkout`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Enroll Now
            </Link>
          </div>
        )}

        {/* Assignments List */}
        {allAssignments.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <CheckSquare className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No assignments available
            </h3>
            <p className="text-slate-600">
              The instructor hasn't added any assignments to this course yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tutorialsWithAssignments.map((tutorial) => {
              if (tutorial.assignments.length === 0) return null;

              return (
                <div key={tutorial.id} className="bg-white rounded-xl border overflow-hidden">
                  {/* Tutorial Header */}
                  <div className="bg-slate-50 border-b px-6 py-4">
                    <h3 className="font-bold text-lg text-slate-900">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {tutorial.assignments.length} assignment{tutorial.assignments.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Assignments */}
                  <div className="divide-y">
                    {tutorial.assignments.map((assignment, index) => {
                      const isLocked = !tutorial.isFree && !canAccess;
                      const submission = assignment.assignmentSubmissions[0];
                      const hasSubmitted = !!submission;

                      return (
                        <Link
                          key={assignment.id}
                          href={
                            isLocked
                              ? "#"
                              : `/courses/${courseId}/tutors/${tutorial.id}/assignments/${assignment.id}`
                          }
                          className={`block px-6 py-4 hover:bg-slate-50 transition-colors ${
                            isLocked ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Status Icon */}
                              <div className="flex-shrink-0 mt-1">
                                {isLocked ? (
                                  <Lock className="h-5 w-5 text-slate-400" />
                                ) : hasSubmitted ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 line-clamp-1">
                                  {assignment.title}
                                </h4>
                                {assignment.description && (
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {assignment.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex gap-2 flex-shrink-0">
                              {isLocked ? (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                  Locked
                                </span>
                              ) : hasSubmitted ? (
                                <>
                                  {submission.isGraded ? (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                      Graded: {submission.grade}%
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                      Pending Review
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  Not Started
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
