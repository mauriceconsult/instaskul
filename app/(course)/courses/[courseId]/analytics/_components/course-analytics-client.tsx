// app/courses/[courseId]/analytics/_components/course-analytics-client.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  Calendar,
  ArrowLeft,
  Target,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CourseAnalyticsClientProps {
  course: {
    id: string;
    title: string;
    instructorName: string;
  };
  stats: {
    totalTutorials: number;
    completedTutorials: number;
    progressPercentage: number;
    totalAssignments: number;
    daysEnrolled: number;
  };
  recentProgress: Array<{
    tutorTitle: string;
    isCompleted: boolean;
    updatedAt: Date;
  }>;
  chartData: Array<{
    date: string;
    count: number;
  }>;
  tutorialsProgress: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    position: number;
  }>;
}

export default function CourseAnalyticsClient({
  course,
  stats,
  recentProgress,
  chartData,
  tutorialsProgress,
}: CourseAnalyticsClientProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
            <p className="text-slate-600 mt-1">{course.title}</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Overall Progress
              </CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.progressPercentage}%
              </div>
              <Progress value={stats.progressPercentage} className="mt-2" />
              <p className="text-xs text-slate-500 mt-2">
                {stats.completedTutorials} of {stats.totalTutorials} tutorials
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Completed
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.completedTutorials}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Tutorials completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Remaining
              </CardTitle>
              <BookOpen className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.totalTutorials - stats.completedTutorials}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Tutorials to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Time Enrolled
              </CardTitle>
              <Clock className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.daysEnrolled}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Days since enrollment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tutorial Progress List */}
          <Card>
            <CardHeader>
              <CardTitle>Tutorial Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {tutorialsProgress.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  No tutorials available
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tutorialsProgress.map((tutorial) => (
                    <Link
                      key={tutorial.id}
                      href={`/courses/${course.id}/tutors/${tutorial.id}`}
                      className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {tutorial.isCompleted ? (
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                                {tutorial.position + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 line-clamp-1">
                              {tutorial.title}
                            </p>
                            <p className="text-xs text-slate-600">
                              {tutorial.isCompleted ? "Completed" : "Not started"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentProgress.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600">No recent activity</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Start learning to see your progress here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProgress.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 line-clamp-1">
                          {activity.tutorTitle}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Trend */}
          {chartData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Learning Activity (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chartData.map((data) => (
                    <div key={data.date} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-slate-600">
                        {data.date}
                      </div>
                      <div className="flex-1">
                        <div
                          className="h-8 bg-blue-100 rounded"
                          style={{
                            width: `${(data.count / Math.max(...chartData.map((d) => d.count))) * 100}%`,
                          }}
                        >
                          <div className="flex items-center justify-end h-full pr-2">
                            <span className="text-sm font-semibold text-blue-700">
                              {data.count} tutorial{data.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Motivational Message */}
        {stats.progressPercentage > 0 && stats.progressPercentage < 100 && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">
                    Keep up the great work! 🎉
                  </h3>
                  <p className="text-sm text-slate-700">
                    You've completed {stats.progressPercentage}% of the course. 
                    Just {stats.totalTutorials - stats.completedTutorials} more tutorial
                    {stats.totalTutorials - stats.completedTutorials !== 1 ? "s" : ""} to go!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stats.progressPercentage === 100 && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Congratulations! 🎊
                </h3>
                <p className="text-slate-700">
                  You've completed all tutorials in this course. Great job!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
