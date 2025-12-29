"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Course, Tutor, Coursework } from "@prisma/client";
import { CheckCircle, Lock, LayoutDashboard, Video, Bell, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface CourseSidebarProps {
  course: Course & {
    tutors: (Tutor & {
      userProgress: { isCompleted: boolean }[];
    })[];
    courseworks: (Coursework & {
      userProgress: { isCompleted: boolean }[];
    })[];
  };
  courseProgressCount: number;
  courseworkProgressCount: number;
  adminId: string; 
}

export const CourseSidebar = ({ 
  course, 
  courseProgressCount,
  courseworkProgressCount,
  adminId,
}: CourseSidebarProps) => {
  const pathname = usePathname();

  const mainRoutes = [
    { 
      icon: LayoutDashboard, 
      label: "Overview", 
      href: `/admins/${adminId}/courses/${course.id}` 
    },
    { 
      icon: Video, 
      label: "Tutorials", 
      href: `/admins/${adminId}/courses/${course.id}/tutors` 
    },
    { 
      icon: Bell, 
      label: "Course notices", 
      href: `/admins/${adminId}/courses/${course.id}/coursenoticeboards` 
    },
    { 
      icon: ClipboardList, 
      label: "Courseworks", 
      href: `/admins/${adminId}/courses/${course.id}/courseworks` 
    },
  ];

  // Calculate overall progress
  const overallProgress = Math.round((courseProgressCount + courseworkProgressCount) / 2);

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      {/* Course Header with Progress */}
      <div className="p-6 border-b space-y-4">
        <h1 className="text-lg font-bold line-clamp-2">{course.title}</h1>
        
        {/* Tutorial Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Tutorials</span>
            <span className="font-semibold text-sky-600">{courseProgressCount}%</span>
          </div>
          <Progress 
            value={courseProgressCount} 
            variant="default" 
            className="h-2" 
          />
        </div>

        {/* Coursework Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Coursework</span>
            <span className="font-semibold text-emerald-700">{courseworkProgressCount}%</span>
          </div>
          <Progress 
            value={courseworkProgressCount} 
            variant="success" 
            className="h-2" 
          />
        </div>

        {/* Overall Progress */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Overall</span>
            <span className="text-lg font-bold text-slate-900">
              {overallProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Course Routes */}
      <div className="py-4 border-b">
        {mainRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-3 px-6 py-4 text-sm font-medium transition-colors hover:bg-slate-100",
              pathname === route.href && "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
            )}
          >
            <route.icon className="h-5 w-5" />
            <span>{route.label}</span>
          </Link>
        ))}
      </div>

      {/* Tutorial List */}
      {course.tutors.length > 0 && (
        <div className="flex-1 py-4">
          <div className="px-6 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Tutorials</p>
          </div>
          {course.tutors.map((tutor) => {
            const isCompleted = tutor.userProgress?.[0]?.isCompleted || false;
            const isActive = pathname?.includes(tutor.id);
            const isLocked = !tutor.isFree && !isCompleted;

            return (
              <Link
                key={tutor.id}
                href={`/admins/${adminId}/courses/${course.id}/tutors/${tutor.id}`}
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500] px-6 py-3 transition-all hover:text-slate-600 hover:bg-slate-100",
                  isActive && "text-slate-700 bg-slate-200/20 border-r-4 border-sky-700",
                  isCompleted && "text-emerald-700 hover:text-emerald-800",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4 flex-shrink-0" />
                ) : isCompleted ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Video className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="line-clamp-1">{tutor.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};