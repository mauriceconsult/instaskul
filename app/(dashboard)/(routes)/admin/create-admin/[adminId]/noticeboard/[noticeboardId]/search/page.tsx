import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNoticeboards } from "@/actions/get-noticeboards";
import { NoticeboardsList } from "./_components/noticeboards-list";
import { Admins } from "../../../search/_components/admins";
import { NoticeboardSearchInput } from "./_components/noticeboard-search-input";

interface NoticeboardSearchPageProps {
  searchParams: Promise<{
    title: string;
    noticeboardId: string;
  }>
}

const NoticeboardSearchPage = async ({
  searchParams
}: NoticeboardSearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/"); 
  }
  const admins = await prisma.admin.findMany({
    orderBy: {
      title: "asc",
    },
  });
  const noticeboards = await getNoticeboards({
    userId,
    ...await searchParams
  }) 
  return (
    <>
      <div className="px-6 pt-4 md:hidden md:mb-0 block">
        <NoticeboardSearchInput />
      </div>
      <div className="p-6">
        <Admins items={admins} />
        <NoticeboardsList items={noticeboards} />
      </div>
    </>
  );
};

export default NoticeboardSearchPage;
