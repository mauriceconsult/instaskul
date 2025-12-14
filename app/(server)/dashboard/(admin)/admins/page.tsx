import { columns } from "@/components/admins/columns";
import { DataTable } from "@/components/admins/data-table";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


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
