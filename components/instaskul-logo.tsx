"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface InstaSkulLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" ;
}

export const InstaSkulLogo: React.FC<InstaSkulLogoProps> = ({
  className,
  size = "md",
}) => {
  const sizeStyles = {
    sm: { logo: "text-xl", tagline: "text-xs", trademark: "text-[10px]" },
    md: { logo: "text-2xl", tagline: "text-sm", trademark: "text-xs" },
    lg: { logo: "text-3xl", tagline: "text-base", trademark: "text-sm" },
  };

  return (
    <Link href="/" className={cn("flex flex-col items-center", className)}>
      <div className="flex items-start">
        <span
          className={cn(
            "font-bold text-slate-900 tracking-tight",
            sizeStyles[size].logo
          )}
        >
          instaSkul
        </span>
        {/* <span
          className={cn(
            "text-slate-900 relative -top-1",
            sizeStyles[size].trademark
          )}
        >
          ®
        </span> */}
      </div>
      <span
        className={cn(
          "text-slate-500 font-medium text-center text-xs",
          sizeStyles[size].tagline
        )}
      >
        Knowledge Management Simplified
      </span>
    </Link>
  );
};
