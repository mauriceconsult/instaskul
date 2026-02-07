// app/courses/[courseId]/courseworks/[courseworkId]/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Lock } from "lucide-react";
import { SubmitCoursework } from "@/components/student/submit-coursework";

interface CourseworkDetailPageProps {
  params: Promise<{ courseId: string; courseworkId: string }>;
}

export default async function CourseworkDetailPage({
  params,
}: CourseworkDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId, courseworkId } = await params;

  const coursework = await prisma.coursework.findUnique({
    where: {
      id: courseworkId,
      courseId,
      isPublished: true,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          admin: {
            select: {
              userId: true,
            },
          },
        },
      },
      courseworkSubmissions: {
        where: {
          userId,
        },
      },
    },
  });

  if (!coursework) {
    notFound();
  }

  // Check enrollment
  const tuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const isEnrolled = tuition?.isPaid || false;
  const isCreator = coursework.course?.admin?.userId === userId;
  const canAccess = isEnrolled || isCreator;

  const existingSubmission = coursework.courseworkSubmissions[0];

  // If not enrolled, show lock screen
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 text-center">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Coursework Locked
          </h1>

          <p className="text-slate-600 mb-6">
            You need to enroll in <strong>{coursework.course?.title}</strong> to access this coursework.
          </p>

          <Link
            href={`/courses/${courseId}/checkout`}
            className="block w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
          >
            Enroll Now
          </Link>

          <Link
            href={`/courses/${courseId}/courseworks`}
            className="block text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to courseworks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/courses/${courseId}/courseworks`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all courseworks
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Coursework Info */}
        <div className="bg-white rounded-xl shadow-sm border p-8 md:p-12 mb-8">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Coursework</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Posted {new Date(coursework.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {coursework.title}
          </h1>

          {/* Course Name */}
          <p className="text-slate-600 mb-8">
            From: <Link href={`/courses/${courseId}`} className="text-blue-600 hover:underline font-medium">
              {coursework.course?.title}
            </Link>
          </p>

          {/* Description/Instructions */}
          {coursework.description && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Instructions</h2>
              <div className="prose prose-slate max-w-none">
                <div
                  className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: coursework.description }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submission Section */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {existingSubmission ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b">
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Submission
                </h2>
                {existingSubmission.isGraded ? (
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    Graded: {existingSubmission.grade}%
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                    Pending Review
                  </span>
                )}
              </div>

              {/* Submitted Content */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Submitted Work:</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  {existingSubmission.text && (
                    <p className="text-slate-700 whitespace-pre-wrap mb-3">
                      {existingSubmission.text}
                    </p>
                  )}
                  {existingSubmission.fileUrl && (
                    <a
                      href={existingSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Attached File
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </p>
              </div>

              {/* Grade & Feedback */}
              {existingSubmission.isGraded && (
                <>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Grade:</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-purple-600">
                        {existingSubmission.grade}%
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div
                            className="bg-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${existingSubmission.grade}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {existingSubmission.feedback && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Instructor Feedback:</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {existingSubmission.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Resubmit Option */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-slate-900 mb-4">Update Your Submission</h3>
                <SubmitCoursework 
                  courseworkId={courseworkId} 
                  existingSubmission={existingSubmission}
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Submit Your Work
              </h2>
              <SubmitCoursework courseworkId={courseworkId} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
