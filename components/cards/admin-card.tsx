"use client";

import Link from "next/link";
import { FC } from "react";
import Image from "next/image";

interface AdminCardProps {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  school: string;
}

export const AdminCard: FC<AdminCardProps> = ({
  id,
  title,
  imageUrl,  
  school,
}) => {
  return (
    <Link href={`/admins/${id}`}>
      <div className="group hover:shadow-md transition overflow-hidden border rounded-lg p-3 h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image fill className="object-cover" alt={title} src={imageUrl} />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition">
            {title}
          </div>
          <p className="text-xs text-muted-foreground">
            {school || "No school"}
          </p>         
        </div>
      </div>
    </Link>
  );
};
