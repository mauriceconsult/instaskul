// app/admins/[adminId]/courses/_components/courses-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  BookOpen, 
  Users, 
  Eye, 
  EyeOff, 
  Edit,
  MoreVertical} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmount } from "@/lib/format";

interface Course {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  amount: string | number | null;
  isPublished: boolean;
  tutors: { id: string }[];
  _count: {
    tutors: number;
    tuitions: number;
  };
  enrollments: number;
}

interface CoursesClientProps {
  courses: Course[];
  adminId: string;
  adminTitle: string;
}

export default function CoursesClient({
  courses,
  adminId,
  adminTitle,
}: CoursesClientProps) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filteredCourses = courses.filter((course) => {
    if (filter === "published") return course.isPublished;
    if (filter === "draft") return !course.isPublished;
    return true;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.isPublished).length,
    draft: courses.filter((c) => !c.isPublished).length,
    totalEnrollments: courses.reduce((sum, c) => sum + c.enrollments, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-slate-600 mt-1">
            Manage courses for {adminTitle}
          </p>
        </div>
        <Link href={`/admin/admins/${adminId}/courses/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Courses</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Published</p>
              <p className="text-3xl font-bold mt-1">{stats.published}</p>
            </div>
            <Eye className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Drafts</p>
              <p className="text-3xl font-bold mt-1">{stats.draft}</p>
            </div>
            <EyeOff className="h-10 w-10 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Students</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEnrollments}</p>
            </div>
            <Users className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filter === "published" ? "default" : "outline"}
          onClick={() => setFilter("published")}
          size="sm"
        >
          Published ({stats.published})
        </Button>
        <Button
          variant={filter === "draft" ? "default" : "outline"}
          onClick={() => setFilter("draft")}
          size="sm"
        >
          Drafts ({stats.draft})
        </Button>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No courses {filter !== "all" && filter}
          </h3>
          <p className="text-slate-600 mb-6">
            {filter === "all" 
              ? "Get started by creating your first course"
              : `No ${filter} courses found`}
          </p>
          {filter === "all" && (
            <Link href={`/admin/admins/${adminId}/courses/create`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border hover:shadow-lg transition-all"
            >
              {/* Course Image */}
              <div className="relative h-48 bg-slate-100 rounded-t-xl overflow-hidden">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
                  {course.title}
                </h3>

                {course.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course._count.tutors} tutorials</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollments} students</span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatAmount(Number(course.amount) || 0)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${course.id}`}>
                            View as Student
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courses/${course.id}/analytics`}>
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
