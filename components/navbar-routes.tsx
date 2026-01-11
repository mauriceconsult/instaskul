"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Menu, Wallet } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Import search inputs only when needed
import { CourseSearchInput } from "./search-input/course-search-input";
import { AdminSearchInput } from "./search-input/admin-search-input";
import { NoticeboardSearchInput } from "./search-input/noticeboard-search-input";
import { CourseworkSearchInput } from "./search-input/coursework-search-input";
import { TutorSearchInput } from "./search-input/tutor-search-input";

interface NavbarRoutesProps {
  className?: string;
  adminId?: string;
  courseId?: string;
}

export default function NavbarRoutes({
  className,
  adminId,
  courseId,
}: NavbarRoutesProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Route flags
  const isRoot = pathname === "/";
  const isSearch = pathname === "/dashboard/search" || pathname.startsWith("/dashboard/search/");
  const isAdminArea = pathname.startsWith("/dashboard/admins") || pathname.startsWith("/dashboard/analytics");
  const isLearnerContent = 
    pathname.includes("/courses/") ||
    pathname.includes("/tutors/") ||
    pathname.includes("/assignments") ||
    pathname.includes("/courseworks/") ||
    pathname.includes("/coursenoticeboards");

  // Dynamic search input
  const getSearchInput = () => {
    if (isSearch) return <AdminSearchInput adminId={adminId} />;
    if (pathname.includes("/courses/") && !pathname.includes("/tutors") && !pathname.includes("/assignments"))
      return <CourseSearchInput adminId={adminId} courseId={courseId} />;
    if (pathname.includes("/tutors/")) return <TutorSearchInput adminId={adminId} courseId={courseId} />;
    if (pathname.includes("/noticeboards/")) return <NoticeboardSearchInput adminId={adminId} />;
    if (pathname.includes("/courseworks/")) return <CourseworkSearchInput adminId={adminId} courseId={courseId} />;
    if (isAdminArea) return <AdminSearchInput adminId={adminId} />;
    return null;
  };

  const searchInput = getSearchInput();

  // Show Payrolls only if user has admin context (adminId present)
  const showPayrolls = !!adminId;

  return (
    <div className={`flex items-center gap-x-2 md:gap-x-4 w-full px-2 md:px-4 ${className}`}>
      {/* Search input – visible on md+ */}
      {searchInput && (
        <div className="hidden md:flex flex-1 min-w-0 max-w-[480px]">
          {searchInput}
        </div>
      )}

      {/* Right side actions */}
      <div className="flex items-center gap-x-2 md:gap-x-4 ml-auto">
        {/* Mobile menu */}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/docs">Docs</Link>
              </DropdownMenuItem>

              {showPayrolls && (
                <DropdownMenuItem asChild>
                  <Link href={`/admins/${adminId}/payrolls`} className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Payrolls
                  </Link>
                </DropdownMenuItem>
              )}

              {(isAdminArea || isLearnerContent) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/search")}
                    className="cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop links */}
        <Link
          href="/docs"
          className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Docs
        </Link>

        {showPayrolls && (
          <Link
            href={`/admins/${adminId}/payrolls`}
            className="hidden md:flex items-center gap-x-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Wallet className="h-4 w-4" />
            <span>Payrolls</span>
          </Link>
        )}

        {/* Exit button (desktop) */}
        {(isAdminArea || isLearnerContent) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/dashboard/search")}
            className="hidden md:flex items-center gap-x-2 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Exit</span>
          </Button>
        )}

        {/* Dashboard entry (root only) */}
        {isRoot && (
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="shrink-0">
              <LogIn className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        )}

        <div className="shrink-0">
          <UserButton afterSwitchSessionUrl="/dashboard/search" />
        </div>
      </div>
    </div>
  );
}