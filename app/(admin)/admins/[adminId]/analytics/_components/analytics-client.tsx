// app/admins/[adminId]/analytics/_components/analytics-client.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign,
  Calendar 
} from "lucide-react";
import { formatAmount } from "@/lib/format";

interface AnalyticsClientProps {
  stats: {
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    publishedCourses: number;
  };
  courseStats: Array<{
    id: string;
    title: string;
    enrollments: number;
    tutorials: number;
    revenue: number;
  }>;
  chartData: Array<{
    date: string;
    count: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    createdAt: Date;
    course: {
      title: string;
      amount: string | number | null;
    };
  }>;
  adminTitle: string;
}

export default function AnalyticsClient({
  stats,
  courseStats,
  chartData,
  recentEnrollments,
  adminTitle,
}: AnalyticsClientProps) {
  const topCourses = courseStats
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Performance insights for {adminTitle}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {formatAmount(stats.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From {stats.totalEnrollments} enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-slate-500 mt-1">
              Across {stats.totalCourses} courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Published Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.publishedCourses}</div>
            <p className="text-xs text-slate-500 mt-1">
              Out of {stats.totalCourses} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Avg. per Course
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalCourses > 0
                ? Math.round(stats.totalEnrollments / stats.totalCourses)
                : 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Students per course
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {topCourses.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No enrollment data yet
              </p>
            ) : (
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-600">
                          {course.tutorials} tutorials
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {course.enrollments}
                      </p>
                      <p className="text-xs text-slate-600">students</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No recent enrollments
              </p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        {enrollment.course.title}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-emerald-600 ml-2">
                      {formatAmount(Number(enrollment.course.amount) || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Trend - Simple Bar Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.map((data) => (
                <div key={data.date} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-600">{data.date}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-blue-100 rounded" style={{ width: `${(data.count / Math.max(...chartData.map(d => d.count))) * 100}%` }}>
                      <div className="flex items-center justify-end h-full pr-2">
                        <span className="text-sm font-semibold text-blue-700">
                          {data.count}
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
  );
}
