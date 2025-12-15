import { prisma } from "@/lib/db";
import { getAdmins } from "@/actions/get-admins";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Schools } from "./_components/schools";
import { AdminSearchInput } from "./_components/admin-search-input";
import { AdminsList } from "./_components/admins-list";

interface AdminSearchPageProps {
  searchParams: Promise<{
    title: string;
    schoolId: string;
  }>;
}
const AdminSearchPage = async ({ searchParams }: AdminSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const schools = await prisma.school.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const admins = await getAdmins({
      userId,     
    ...await searchParams,
  });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <AdminSearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Schools items={schools} />
        <AdminsList items={admins} />
      </div>
    </>
  );
};
export default AdminSearchPage;
