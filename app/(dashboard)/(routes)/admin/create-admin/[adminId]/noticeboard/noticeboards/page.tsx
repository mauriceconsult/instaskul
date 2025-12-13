import { auth } from "@clerk/nextjs/server";
import { columns } from "./_components/noticeboard-columns";
import { DataTable } from "./_components/noticeboard-data-table";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

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
