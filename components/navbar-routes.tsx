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

  // Reuse route checks from SidebarRoutes, plus /search
  const isAdminPage = pathname?.includes("/admin");
  const isCoursePage = pathname?.includes("/courses");
  const isTutorPage = pathname?.includes("/tutorials");
  const isNoticeboardPage = pathname?.includes("/noticeboards");
  const isCourseworkPage = pathname?.includes("/courseworks");
  const isCourseNoticeboardPage = pathname?.includes("/course-coursenoticeboards");
  const isAssignmentPage = pathname?.includes("/assignments");
  const isPayrollPage = pathname?.includes("/payrolls");
  const isSearchPage = pathname === "/search";
  const isRootPage = pathname === "/";

  return (
    <div className={`flex items-center gap-x-4 w-full px-4 ${className}`}>
      {isCoursePage && (
        <div className="w-64">
          <CourseSearchInput adminId={adminId} courseId={courseId} />
        </div>
      )}
      <Link
        href="/docs"
        className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors ml-auto"
      >
        Docs
      </Link>
      <div className="flex gap-x-2 ml-auto">
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
        {isRootPage && (
          <Link href="/admin/admins">
            <Button size="sm" variant="ghost">
              <LogIn className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavbarRoutes;
