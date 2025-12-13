import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/coursework-data-table";
import { columns } from "./_components/coursework-columns";


const CourseworksPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const courseworks = await prisma.coursework.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={courseworks} />
    </div>
  );
};
export default CourseworksPage;
