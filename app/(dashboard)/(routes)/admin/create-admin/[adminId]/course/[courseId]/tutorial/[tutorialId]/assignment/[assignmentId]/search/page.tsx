import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssignmentSearchInput } from "./_components/assignment-search-input";
import { AssignmentsList } from "./_components/assignments-list";
import { getAssignments } from "@/actions/get-assignments";
import { Tutors } from "../../../search/_components/tutors";

interface AssignmentSearchPageProps {
  searchParams: Promise<{
    title?: string;
    adminId?: string;
    courseId?: string;
    tutorialId?: string;
    assignmentId?: string;
  }>;
}

const AssignmentSearchPage = async ({ searchParams }: AssignmentSearchPageProps) => {
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
    include: {
      course: true,
    },
  });

  const assignments = await getAssignments({
    userId,
    title: resolvedParams.title,
    tutorId: resolvedParams.tutorialId,
  });

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <AssignmentSearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Tutors items={tutorials} />
        <AssignmentsList
          items={assignments}    
          tutorialId={resolvedParams.tutorialId}
        />
      </div>
    </div>
  );
};

export default AssignmentSearchPage;
