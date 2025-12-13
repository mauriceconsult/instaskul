import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAssignments } from "@/actions/get-assignments";
import { AssignmentSearchInput } from "../assignment/[assignmentId]/search/_components/assignment-search-input";
import { AssignmentsList } from "../assignment/[assignmentId]/search/_components/assignments-list";
import { Tutors } from "./_components/tutors";

interface TutorSearchPageProps {
  searchParams: Promise<{
    title?: string;
    courseId?: string;
    adminId?: string;
    tutorialId?: string;
  }>;
}

const TutorSearchPage = async ({ searchParams }: TutorSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const resolvedParams = await searchParams;
  const tutorials = await prisma.tutor.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const assignments = await getAssignments({
    userId,
    title: resolvedParams.title,
    tutorId: resolvedParams.tutorialId,
  });

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="px-6 pt-4 md:hidden md:mb-0 block">
        <AssignmentSearchInput />
      </div>
      <div className="p-6 space-y-6">
        <Tutors items={tutorials} />
        <AssignmentsList
          items={assignments}
          tutorialId={resolvedParams.tutorialId ?? ""}
          // adminId={resolvedParams.adminId ?? ""}
          // tutorId={resolvedParams.tutorialId}
        />
      </div>
    </div>
  );
};

export default TutorSearchPage;
