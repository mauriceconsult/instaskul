// components/course-overview.tsx
import Image from "next/image";
import Link from "next/link";
import { formatAmount } from "@/lib/format";
import { BookOpen, CheckCircle, Clock, FileText } from "lucide-react";

interface CourseOverviewProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    amount: string | number | null;
    admin: {
      title: string;
    } | null;
    tutors: Array<{
      assignments?: Array<any>;
    }>;
    courseworks: Array<any>;
  };
  isEnrolled: boolean;
  isCreator: boolean;
  progressPercentage: number;
  totalTutorials: number;
  completedTutorials: number;
}

export function CourseOverview({
  course,
  isEnrolled,
  isCreator,
  progressPercentage,
  totalTutorials,
  completedTutorials,
}: CourseOverviewProps) {
  const totalAssignments = course.tutors.reduce(
    (acc, tutor) => acc + (tutor.assignments?.length || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Course Image */}
        {course.imageUrl && (
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Course Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {course.title}
          </h1>
          <p className="text-slate-600 mb-4">
            By <span className="font-semibold">{course.admin?.title || "Instructor"}</span>
          </p>

          {course.description && (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed">
                {course.description}
              </p>
            </div>
          )}
        </div>

        {/* Progress (if enrolled) */}
        {isEnrolled && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Your Progress</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Overall Completion
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {completedTutorials}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Completed
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {totalTutorials - completedTutorials}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Course Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">Course Content</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {totalTutorials} Tutorials
                </div>
                <div className="text-xs text-slate-600">
                  Video lessons
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {totalAssignments} Assignments
                </div>
                <div className="text-xs text-slate-600">
                  Practice exercises
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {course.courseworks.length} Courseworks
                </div>
                <div className="text-xs text-slate-600">
                  Final projects
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment CTA */}
        {!isEnrolled && !isCreator && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {formatAmount(Number(course.amount) || 0)}
              </div>
              <div className="text-sm text-slate-600">
                One-time payment
              </div>
            </div>

            <Link
              href={`/courses/${course.id}/checkout`}
              className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Enroll Now
            </Link>

            <div className="mt-4 pt-4 border-t">
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Full lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  All tutorials & assignments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Creator Actions */}
        {isCreator && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-4">Creator Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/courses/${course.id}`}
                className="block w-full py-2 bg-slate-100 text-slate-700 text-center rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Edit Course
              </Link>
              <Link
                href={`/admin/courses/${course.id}/analytics`}
                className="block w-full py-2 bg-slate-100 text-slate-700 text-center rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                View Analytics
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
