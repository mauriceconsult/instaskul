import { CourseworkCard } from "@/components/coursework-card";
import { Course, Coursework } from "@prisma/client";
import { getProgress } from "@/actions/get-progress";

type CourseworksWithCourse = Coursework & {
  course: Course | null;
};

interface CourseworksListProps {
  items: CourseworksWithCourse[];
  userId?: string; // Added for progress calculation
}

export const CourseworksList = ({ items, userId }: CourseworksListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map(async (item) => {
          const progress = userId ? await getProgress(userId, item.courseId ?? "") : null;
          return (
            <CourseworkCard
              key={item.id}
              id={item.id}
              title={item.title}
              course={item.course?.title ?? ""}
              courseworksLength={1} // Set to 1 since item.courseworks does not exist
              progress={progress}
              description={item.description ?? ""} // Fixed: use item.description
            />
          );
        })}
      </div>
      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No Courseworks found.
        </div>
      )}
    </div>
  );
};
