import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/assignment-data-table";
import { columns } from "./_components/assignment-columns";


const AssignmentsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={assignments} />
    </div>
  );
};
export default AssignmentsPage;
