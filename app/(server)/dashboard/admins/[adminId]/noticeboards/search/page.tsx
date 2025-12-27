import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNoticeboards } from "@/actions/get-noticeboards";
import { NoticeboardSearchInput } from "@/components/search-input/noticeboard-search-input";
import { Admins } from "../../../search/_components/admins";
import { NoticeboardsList } from "@/components/lists/noticeboards-list";


interface NoticeboardSearchPageProps {
  searchParams: Promise<{
    title: string;
    adminId: string;
  }>;
}

const NoticeboardSearchPage = async ({ searchParams }: NoticeboardSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { title, adminId } = await searchParams;

  // Fetch courses for filter pills (only those with published courses)
  const admins = await prisma.admin.findMany({
    where: {
      courses: {
        some: { isPublished: true },
      },
    },
    orderBy: { title: "asc" },
  });

  // Fetch noticeboards based on search/filter
  const noticeboards = await getNoticeboards({
    userId,
    title,
    adminId,
  });

  return (
    <>
      {/* Mobile search */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <NoticeboardSearchInput />
      </div>

      <div className="p-6 space-y-8">
        {/* Admin filter buttons */}
        {admins.length > 0 && <Admins items={admins} />}

        {/* Noticeboard grid */}
        <NoticeboardsList items={noticeboards} />
      </div>
    </>
  );
};

export default NoticeboardSearchPage;