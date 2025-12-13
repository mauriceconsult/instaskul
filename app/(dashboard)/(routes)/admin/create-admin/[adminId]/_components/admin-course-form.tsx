"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminCourseFormProps {
  initialData: {
    courses: { id: string; title: string; isPublished: boolean }[];
  };
  adminId: string;
}

export const AdminCourseForm = ({
  initialData,
  adminId,
}: AdminCourseFormProps) => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-700">
        Add and manage courses for this Admin Direct. At least one published
        course is required to publish the Admin Direct.
      </div>
      {initialData.courses.length === 0 ? (
        <div className="text-sm text-slate-500 italic">
          No courses added yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {initialData.courses.map((course) => (
            <li
              key={course.id}
              className="flex items-center justify-between p-2 border rounded-md bg-white"
            >
              <span>{course.title}</span>
              <Link
                href={`/admin/create-admin/${adminId}/course/${course.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                <Button variant="ghost" size="sm">
                  Edit {course.isPublished ? "(Published)" : "(Unpublished)"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button
        onClick={() => router.push(`/admin/create-admin/${adminId}/course/new`)}
        variant="outline"
        size="sm"
      >
        Add Course
      </Button>
    </div>
  );
};
