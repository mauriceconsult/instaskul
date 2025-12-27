import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DataTable } from "./_components/admin-data-table";
import { columns } from "./_components/admin-columns";

const AdminsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const admins = await prisma.admin.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <DataTable columns={columns} data={admins} />
    </div>
  );
};
export default AdminsPage;
