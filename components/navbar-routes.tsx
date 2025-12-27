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
  const isDashboardPage = pathname === "/dashboard";
  const isSearchPage = pathname.includes("/search");
  
  // Admin section checks
  const isAdminSection = pathname.includes("/dashboard/admins") || pathname.includes("/dashboard/analytics");
  
  // Course-related pages
  const isCoursePage = pathname.includes("/courses/") && !pathname.includes("/tutors") && !pathname.includes("/assignments");
  const isTutorPage = pathname.includes("/tutors/");
  const isAssignmentPage = pathname.includes("/assignments");
  const isCoursenoticeboardPage = pathname.includes("/coursenoticeboards");
  const isNoticeboardPage = pathname.includes("/noticeboards/");
  const isCourseworkPage = pathname.includes("/courseworks/");

  // Search input to show
  const renderSearchInput = () => {
    if (isCoursePage) return <CourseSearchInput adminId={adminId} courseId={courseId} />;
    if (isTutorPage) return <TutorSearchInput adminId={adminId} courseId={courseId} />;
    if (isNoticeboardPage) return <NoticeboardSearchInput adminId={adminId} />;
    if (isCourseworkPage) return <CourseworkSearchInput adminId={adminId} courseId={courseId} />;
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
        {/* Docs */}
        <Link
          href="/docs"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium transition"
        >
          Docs
        </Link>

        {/* Exit Button - Shows in admin section, goes back to learner view */}
        {isAdminSection && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit to Learner View
          </Button>
        )}

        {/* Exit Button - Shows on course/content pages, goes to search */}
        {(isCoursePage || isTutorPage || isAssignmentPage || isCourseworkPage || isCoursenoticeboardPage) && !isAdminSection && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/dashboard/search")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        )}

        {/* Dashboard Button - Shows on root page */}
        {isRootPage && (
          <Link href="/dashboard">
            <Button size="sm" variant="ghost">
              <LogIn className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        )}

        {/* User Button */}
        <UserButton afterSwitchSessionUrl="/dashboard" />
      </div>
    </div>
  );
};

export default NavbarRoutes;