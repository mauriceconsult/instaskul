import { auth } from "@clerk/nextjs/server";
import { columns } from "@/app/(dashboard)/(routes)/admin/admins/_components/admins-columns";
import { DataTable } from "@/app/(dashboard)/(routes)/admin/admins/_components/admins-data-table";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

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
