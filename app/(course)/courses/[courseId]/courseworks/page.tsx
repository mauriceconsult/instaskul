// app/courses/[courseId]/courseworks/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Lock, CheckCircle } from "lucide-react";

interface CourseworksPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseworksPage({ params }: CourseworksPageProps) {
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

  // Fetch courseworks with user's submissions
  const courseworks = await prisma.coursework.findMany({
    where: {
      courseId,
      isPublished: true,
    },
    include: {
      courseworkSubmissions: {
        where: {
          userId,
        },
        select: {
          id: true,
          submittedAt: true,
          isGraded: true,
          grade: true,
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Link>

          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Courseworks</h1>
              <p className="text-slate-600">{course.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courseworks List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!canAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <p className="text-yellow-800 mb-4">
              🔒 <strong>Enrollment Required:</strong> You need to enroll in this course to access courseworks.
            </p>
            <Link
              href={`/courses/${courseId}/checkout`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Enroll Now
            </Link>
          </div>
        )}

        {courseworks.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No courseworks available
            </h3>
            <p className="text-slate-600">
              The instructor hasn't added any courseworks yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courseworks.map((coursework, index) => {
              const isLocked = !canAccess;
              const submission = coursework.courseworkSubmissions[0]; // User can only have one submission per coursework
              const hasSubmitted = !!submission;

              return (
                <Link
                  key={coursework.id}
                  href={isLocked ? "#" : `/courses/${courseId}/courseworks/${coursework.id}`}
                  className={`block bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-200 group ${
                    isLocked ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        hasSubmitted 
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {hasSubmitted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {coursework.title}
                        </h3>
                        
                        {/* Status Badges */}
                        <div className="flex gap-2 flex-shrink-0">
                          {hasSubmitted && (
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
                          )}
                        </div>
                      </div>

                      {coursework.description && (
                        <p className="text-slate-600 mb-4 line-clamp-2">
                          {coursework.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                              <Lock className="h-4 w-4" />
                              Locked
                            </span>
                          ) : hasSubmitted ? (
                            <div className="text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>
                                  Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                              Start Coursework
                              →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
