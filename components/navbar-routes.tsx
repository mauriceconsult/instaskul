"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { CourseSearchInput } from "./search-input/course-search-input";
import { AdminSearchInput } from "./search-input/admin-search-input";
import { NoticeboardSearchInput } from "./search-input/noticeboard-search-input";
import { CourseworkSearchInput } from "./search-input/coursework-search-input";
import { TutorSearchInput } from "./search-input/tutor-search-input";
import { UserButton } from "@clerk/nextjs";

interface NavbarRoutesProps {
  className?: string;
  adminId?: string;
  courseId?: string;
}

const NavbarRoutes = ({ className, adminId, courseId }: NavbarRoutesProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Route checks
  const isRootPage = pathname === "/";
  const isAdminSection = pathname.startsWith("/dashboard/admins") || pathname.startsWith("/dashboard/analytics");
  const isLearnerContentPage = 
    pathname.includes("/courses/") ||
    pathname.includes("/tutors/") ||
    pathname.includes("/assignments") ||
    pathname.includes("/courseworks/") ||
    pathname.includes("/coursenoticeboards");

  // Search input logic (unchanged)
  const renderSearchInput = () => {
    if (pathname.includes("/courses/") && !pathname.includes("/tutors") && !pathname.includes("/assignments")) {
      return <CourseSearchInput adminId={adminId} courseId={courseId} />;
    }
    if (pathname.includes("/tutors/")) return <TutorSearchInput adminId={adminId} courseId={courseId} />;
    if (pathname.includes("/noticeboards/")) return <NoticeboardSearchInput adminId={adminId} />;
    if (pathname.includes("/courseworks/")) return <CourseworkSearchInput adminId={adminId} courseId={courseId} />;
    if (isAdminSection) return <AdminSearchInput adminId={adminId} />;
    return null;
  };

  return (
    <div className={`flex items-center gap-x-4 w-full px-4 ${className}`}>
      {/* Dynamic Search Input */}
      <div className="w-64">
        {renderSearchInput()}
      </div>

      {/* Right Side Navigation */}
      <div className="flex items-center gap-x-4 ml-auto">
        <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Docs
        </Link>

        {/* Exit Button - Unified for ALL admin & content pages */}
        {(isAdminSection || isLearnerContentPage) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/dashboard/search")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit to Learner View
          </Button>
        )}

        {/* Dashboard Login - Only on root */}
        {isRootPage && (
          <Link href="/dashboard">
            <Button size="sm" variant="ghost">
              <LogIn className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        )}

        <UserButton afterSwitchSessionUrl="/dashboard/search" />
      </div>
    </div>
  );
};

export default NavbarRoutes;