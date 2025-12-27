import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/noticeboard-data-table";
import { columns } from "./_components/noticeboard-columns";


const NoticeboardsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const noticeboards = await prisma.noticeboard.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={noticeboards} />
    </div>
  );
};
export default NoticeboardsPage;
