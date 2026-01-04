"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

interface AdminCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  school: string;
}

export const AdminCard = ({
  id,
  title,
  imageUrl,
  school,
  description,
}: AdminCardProps) => {
  return (
    <Link
      href={`/admins/${id}`}
      className="group block h-full"
    >
      <div className="overflow-hidden border rounded-lg bg-white shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
        {/* Image Section */}
        <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              fill
              src={imageUrl}
              alt={title}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            // Fallback for null images
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <div className="text-center">
                <User className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No photo</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-sky-700 transition-colors">
            {title}
          </h3>
          
          <p className="text-xs text-muted-foreground font-medium">
            {school || "Unassigned"}
          </p>
          
          {description && (
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};