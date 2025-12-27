import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAssignments } from "@/actions/get-assignments";
import { AssignmentSearchInput } from "@/components/search-input/assignment-search-input";
import { Tutors } from "../../../search/_components/tutors";
import { AssignmentsList } from "@/components/lists/assignments-list";

interface AssignmentSearchPageProps {
  searchParams: Promise<{
    title: string;
    tutorId: string;
  }>;
}

const AssignmentSearchPage = async ({ searchParams }: AssignmentSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { title, tutorId } = await searchParams;

  // Fetch assignments for filter pills (only those with published assignments)
  const tutors = await prisma.tutor.findMany({
    where: {
      assignments: {
        some: { isPublished: true },       
      },
    },
    orderBy: { title: "asc" },
  });

  // Fetch assignments based on search/filter
  const assignments = await getAssignments({
    userId,
    title,
    tutorId,
  });

  return (
    <>
      {/* Mobile search */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <AssignmentSearchInput />
      </div>

      <div className="p-6 space-y-8">
        {/* Assignment filter buttons */}
        {tutors.length > 0 && <Tutors items={tutors} />}

        {/* Noticeboard grid */}
        <AssignmentsList items={assignments} />
      </div>
    </>
  );
};

export default AssignmentSearchPage;