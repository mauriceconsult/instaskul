"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CourseTutorFormProps {
  initialData: {
    tutors: { id: string; title: string; isPublished: boolean }[];
  };
  adminId: string;
  courseId: string;
}

export const CourseTutorForm = ({
  initialData,
  adminId,
  courseId,
}: CourseTutorFormProps) => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-700">
        Add and manage tutors for this Course Direct. At least one published
        tutor is required to publish the Course Direct.
      </div>
      {initialData.tutors.length === 0 ? (
        <div className="text-sm text-slate-500 italic">
          No tutors added yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {initialData.tutors.map((tutor) => (
            <li
              key={tutor.id}
              className="flex items-center justify-between p-2 border rounded-md bg-white"
            >
              <span>{tutor.title}</span>
              <Link
                href={`/admin/create-admin/${adminId}/course/${courseId}/tutor/${tutor.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                <Button variant="ghost" size="sm">
                  Edit {tutor.isPublished ? "(Published)" : "(Unpublished)"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button
        onClick={() => router.push(`/admin/create-admin/${adminId}/tutor/new`)}
        variant="outline"
        size="sm"
      >
        Add Tutor
      </Button>
    </div>
  );
};
