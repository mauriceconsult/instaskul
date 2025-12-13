"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AdminsWithSchool } from "@/actions/get-admins";


interface AdminCourseListProps {
  items: AdminsWithSchool[];
}

export const AdminCourseList = ({ items }: AdminCourseListProps) => {
  useEffect(() => {
    console.log("AdminCourseList items:", items);
  }, [items]);

  return (
    <div className="mt-2">
      {items.length === 0 ? (
        <p className="text-slate-500 italic">No admins available.</p>
      ) : (
        items.map((admin) => (
          <Link
            key={admin.id}
            href={`/admins/${admin.id}`}
            className="flex items-center gap-4 p-2 border-b hover:bg-slate-50 transition"
          >
            <span className="flex-1 font-medium">{admin.title}</span>
            <span className="text-sm text-slate-600">
              {admin.school?.name || "No School"}
            </span>
            <span className="text-sm text-slate-500">
              {admin.courses.length} {admin.courses.length === 1 ? "Course" : "Courses"}
            </span>
          </Link>
        ))
      )}
    </div>
  );
};
