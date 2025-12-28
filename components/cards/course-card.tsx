"use client";

import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  admin: string;
  tutorialsLength: number;
  progress: number | null;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  description,
  admin,
  tutorialsLength,
  progress,
}: CourseCardProps) => {
  return (
    <Link href={`/admins/${id}/courses/${id}/tutors/${id}`} className="group block">
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg transition">
        <div className="relative aspect-video">
          <Image
            fill
            src={imageUrl}
            alt={title}
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">By {admin}</p>
          <p className="text-sm text-muted-foreground">
            {tutorialsLength} tutorial{tutorialsLength !== 1 ? "s" : ""}
          </p>
          {description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
          )}
          {progress !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};