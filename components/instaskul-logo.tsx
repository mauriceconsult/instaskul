// components/instaskul-logo.tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface InstaSkulLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  linkTo?: string;
}

export const InstaSkulLogo: React.FC<InstaSkulLogoProps> = ({
  className,
  size = "md",
  showTagline = true,
  linkTo = "/",
}) => {
  const sizeStyles = {
    sm: { logo: "text-xl", tagline: "text-xs", trademark: "text-[10px]" },
    md: { logo: "text-2xl", tagline: "text-sm", trademark: "text-xs" },
    lg: { logo: "text-3xl", tagline: "text-base", trademark: "text-sm" },
  };

  return (
    <Link href={linkTo} className={cn("flex flex-col items-center", className)}>
      <div className="flex items-start">
        <span
          className={cn(
            "font-bold text-slate-900 dark:text-slate-100 tracking-tight",
            sizeStyles[size].logo
          )}
        >
          instaSkul
        </span>
      </div>
      {showTagline && (
        <span
          className={cn(
            "text-slate-500 dark:text-slate-400 font-medium text-center",
            sizeStyles[size].tagline
          )}
        >
          Knowledge Management Simplified
        </span>
      )}
    </Link>
  );
};