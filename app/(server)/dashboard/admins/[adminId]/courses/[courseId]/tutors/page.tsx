import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/tutor-data-table";
import { columns } from "./_components/tutor-columns";


const TutorsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const tutors = await prisma.tutor.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={tutors} />
    </div>
  );
};
export default TutorsPage;
