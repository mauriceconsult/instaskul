"use client";

import { TutorialWithCourse } from "@/actions/get-tutors";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


interface TutorListProps {
  items: TutorialWithCourse[];
  courseId: string;
  adminId: string;
}

export default function TutorList({
  items,
  courseId,
  adminId,
 
}: TutorListProps) {
  const searchParams = useSearchParams();
  const selectedTutorialId = searchParams.get("tutorialId");

  const getTutorialStatus = (tutorial: TutorialWithCourse, index: number) => {
    const nextTutorial = items[index + 1];
    return {
      isLocked: !(tutorial.isFree ?? false),
      completeOnEnd: !(tutorial.isFree ?? false),
      nextTutorialId: nextTutorial?.id ?? null,
    };
  };

  return (
    <div className="space-y-2 text-sm sm:text-base">
      {items.map((tutorial, index) => {
        const { isLocked } = getTutorialStatus(
          tutorial,
          index
        );
        return (
          <div key={tutorial.id} className="space-y-2">
            <Link
              href={
                isLocked
                  ? "#"
                  : `/admin/admins/${adminId}/course/${courseId}/tutorial/${tutorial.id}`
              }
              className={`block p-2 rounded-md ${selectedTutorialId === tutorial.id
                  ? "bg-blue-100"
                  : isLocked
                    ? "bg-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              onClick={() =>
                isLocked
                  ? console.log(
                    `[${new Date().toISOString()} TutorList] Locked tutorial clicked: ${tutorial.id
                    }`
                  )
                  : console.log(
                    `[${new Date().toISOString()} TutorList] Navigating to tutorial: ${tutorial.id
                    }`
                  )
              }
            >
              <div className="flex items-center justify-between">
                <span>{tutorial.title}</span>
                {tutorial.isFree ?? false ? (
                  <span className="text-green-500 text-xs sm:text-sm">
                    (Free)
                  </span>
                ) : isLocked ? (
                  <span className="text-red-500 text-xs sm:text-sm">
                    (Locked)
                  </span>
                ) : (
                  <span className="text-blue-500 text-xs sm:text-sm">
                    (Unlocked)
                  </span>
                )}
              </div>
            </Link>

            {items.length === 0 && (
              <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
                No tutorials found.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
