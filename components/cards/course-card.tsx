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
  amount: string; // Course amount (required)
  freeTutorialsCount?: number; // Optional: show preview count
  progress: number | null;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  description,
  admin,
  tutorialsLength,
  amount,
  freeTutorialsCount,
  progress,
}: CourseCardProps) => {
  // Parse amount to number for display
  const priceValue = parseFloat(amount) || 0;
  const isFree = priceValue === 0;

  return (
    <Link href={`/courses/${id}`} className="group block">
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg transition">
        <div className="relative aspect-video">
          <Image
            fill
            src={imageUrl}
            alt={title}
            className="object-cover group-hover:scale-105 transition"
          />
          {/* Free tutorials badge */}
          {freeTutorialsCount && freeTutorialsCount > 0 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              {freeTutorialsCount} Free Preview{freeTutorialsCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">By {admin}</p>
            <p className={cn(
              "text-lg font-bold",
              isFree ? "text-red-600" : "text-emerald-600"
            )}>
              {isFree ? "Contact Admin" : `UGX ${priceValue.toLocaleString()}`}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {tutorialsLength} tutorial{tutorialsLength !== 1 ? "s" : ""}
          </p>
          
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
          
          {progress !== null && (
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
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