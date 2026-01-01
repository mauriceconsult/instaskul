"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  admin: string;
  tutorialsLength: number;
  freeTutorialsCount?: number;
  amount?: string | null;
  progress?: number | null;  // Already optional
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  description,
  admin,
  tutorialsLength,
  freeTutorialsCount = 0,
  amount,
  progress,
}: CourseCardProps) => {
  // Parse amount safely
  const priceValue = amount ? parseFloat(amount) : null;
  const isFree = priceValue === 0 || priceValue === null;

  return (
    <Link href={`/courses/${id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-video">
          <Image
            fill
            src={imageUrl}
            alt={title}
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Free Preview Badge */}
          {freeTutorialsCount > 0 && (
            <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {freeTutorialsCount} Free Preview{freeTutorialsCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-bold text-xl line-clamp-2 text-gray-900 group-hover:text-blue-600 transition">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">By {admin}</p>
            <p className={cn(
              "text-xl font-bold",
              isFree ? "text-red-600" : "text-emerald-600"
            )}>
              {isFree ? "Contact Admin" : `UGX ${priceValue?.toLocaleString()}`}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            {tutorialsLength} tutorial{tutorialsLength !== 1 ? "s" : ""}
          </p>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}

      {progress != null && progress > 0 && (
  <div className="pt-3">
    <div className="flex justify-between text-xs mb-2">
      <span className="text-muted-foreground">Progress</span>
      <span className="font-semibold text-gray-700">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-700"
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