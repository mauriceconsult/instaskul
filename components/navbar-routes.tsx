"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { CourseSearchInput } from "./course-search-input";

interface NavbarRoutesProps {
  className?: string;
  adminId?: string;
  courseId?: string;
}

const NavbarRoutes = ({ className, adminId, courseId }: NavbarRoutesProps) => {
  const pathname = usePathname();
  const router = useRouter();
  console.log("[NavbarRoutes] Pathname:", pathname);

  // Route checks
  const isAdminPage = pathname?.startsWith("/dashboard");
  const isCoursePage = pathname?.includes("/courses");
  const isTutorPage = pathname?.includes("/tutorials");
  const isNoticeboardPage = pathname?.includes("/noticeboards");
  const isCourseworkPage = pathname?.includes("/courseworks");
  const isCourseNoticeboardPage = pathname?.includes("/course-coursenoticeboards");
  const isAssignmentPage = pathname?.includes("/assignments");
  const isPayrollPage = pathname?.includes("/payroll"); 
  const isSearchPage = pathname === "/search";
  const isRootPage = pathname === "/";

  return (
    <div className={`flex items-center gap-x-4 w-full px-4 ${className}`}>
      {/* Course Search - only show on course pages */}
      {isCoursePage && (
        <div className="w-64">
          <CourseSearchInput adminId={adminId} courseId={courseId} />
        </div>
      )}

      {/* Right side navigation links */}
      <div className="flex items-center gap-x-4 ml-auto">
        {/* Docs Link */}
        <Link
          href="/docs"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          Docs
        </Link>

        {/* Payroll Link - only show when user is authenticated (not on root page) */}
        {!isRootPage && (
          <Link
            href="/payroll"
            className={`text-sm font-medium transition-colors ${
              isPayrollPage 
                ? "text-blue-600 font-semibold" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Payroll
          </Link>
        )}

        {/* Exit Button - show on internal pages */}
        {(isAdminPage ||
          isCoursePage ||
          isTutorPage ||
          isNoticeboardPage ||
          isCourseworkPage ||
          isCourseNoticeboardPage ||
          isAssignmentPage ||
          isPayrollPage ||
          isSearchPage) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              console.log("[NavbarRoutes] Exit clicked");
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        )}

        {/* Admin Login - only show on root page */}
        {isRootPage && (
          <Link href="/dashboard">
            <Button size="sm" variant="ghost">
              <LogIn className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavbarRoutes;
