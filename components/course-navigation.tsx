// components/course-navigation.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, CheckSquare, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseNavigationProps {
  course: {
    id: string;
    title: string;
    tutors: Array<{
      id: string;
      title: string;
      position: number | null;
      isFree: boolean;
      assignments: Array<{ id: string; title: string }>;
      userProgress: Array<{ isCompleted: boolean }>;
    }>;
    courseworks: Array<{
      id: string;
      title: string;
      position: number | null;
    }>;
  };
  isEnrolled: boolean;
  isCreator: boolean;
}

export function CourseNavigation({ 
  course, 
  isEnrolled, 
  isCreator 
}: CourseNavigationProps) {
  const [activeTab, setActiveTab] = useState<"tutorials" | "courseworks" | "assignments">("tutorials");

  const allAssignments = course.tutors.flatMap((tutor) =>
    tutor.assignments.map((assignment) => ({
      ...assignment,
      tutorTitle: tutor.title,
      tutorId: tutor.id,
    }))
  );

  const canAccess = isEnrolled || isCreator;

  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-4 flex items-center justify-between">
          <Link
            href="/dashboard/search"
            className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to courses
          </Link>
          <h1 className="text-xl font-bold text-slate-900 truncate max-w-md">
            {course.title}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-t">
          <button
            onClick={() => setActiveTab("tutorials")}
            className={cn(
              "py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === "tutorials"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Tutorials ({course.tutors.length})
          </button>

          <button
            onClick={() => setActiveTab("courseworks")}
            className={cn(
              "py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === "courseworks"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <FileText className="h-4 w-4" />
            Courseworks ({course.courseworks.length})
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={cn(
              "py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === "assignments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <CheckSquare className="h-4 w-4" />
            Assignments ({allAssignments.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="border-t bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tutorials Tab */}
          {activeTab === "tutorials" && (
            <div className="space-y-3">
              {course.tutors.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  No tutorials available yet.
                </p>
              ) : (
                course.tutors.map((tutor, index) => {
                  const isCompleted = tutor.userProgress[0]?.isCompleted || false;
                  const isLocked = !tutor.isFree && !canAccess;

                  return (
                    <Link
                      key={tutor.id}
                      href={isLocked ? "#" : `/courses/${course.id}/tutors/${tutor.id}`}
                      className={cn(
                        "block p-4 bg-white rounded-lg border hover:shadow-md transition-all",
                        isLocked && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                            isCompleted 
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          )}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {tutor.title}
                            </h3>
                            <p className="text-xs text-slate-600">
                              {tutor.assignments.length} assignment{tutor.assignments.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                          {isCompleted && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Courseworks Tab */}
          {activeTab === "courseworks" && (
            <div className="space-y-3">
              {course.courseworks.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  No courseworks available yet.
                </p>
              ) : (
                course.courseworks.map((coursework, index) => {
                  const isLocked = !canAccess;

                  return (
                    <Link
                      key={coursework.id}
                      href={isLocked ? "#" : `/courses/${course.id}/courseworks/${coursework.id}`}
                      className={cn(
                        "block p-4 bg-white rounded-lg border hover:shadow-md transition-all",
                        isLocked && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-slate-900">
                            {coursework.title}
                          </h3>
                        </div>
                        {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="space-y-3">
              {allAssignments.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  No assignments available yet.
                </p>
              ) : (
                allAssignments.map((assignment) => {
                  const isLocked = !canAccess;

                  return (
                    <Link
                      key={assignment.id}
                      href={isLocked ? "#" : `/courses/${course.id}/tutors/${assignment.tutorId}/assignments/${assignment.id}`}
                      className={cn(
                        "block p-4 bg-white rounded-lg border hover:shadow-md transition-all",
                        isLocked && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {assignment.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1">
                            From: {assignment.tutorTitle}
                          </p>
                        </div>
                        {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Enrollment CTA for locked content */}
          {!canAccess && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-800 mb-3">
                🔒 Enroll in this course to access all tutorials, courseworks, and assignments
              </p>
              <Link
                href={`/courses/${course.id}/checkout`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
