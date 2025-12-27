import { prisma } from "@/lib/db";
import { Schools } from "./_components/schools";
import { getAdmins } from "@/actions/get-admins";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSearchInput } from "@/components/search-input/admin-search-input";
import { AdminsList } from "@/components/lists/admins-list";

interface SearchPageProps {
  searchParams: Promise<{
    title: string;
    schoolId: string;
  }>;
}
const SearchPage = async ({ searchParams }: SearchPageProps) => {
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
export default SearchPage;
