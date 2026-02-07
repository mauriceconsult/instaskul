// app/admins/[adminId]/noticeboards/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import NoticeboardsClient from "./_components/noticeboards-client";

export default async function NoticeboardsPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId } = await params;

  // Verify ownership
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      userId,
    },
    select: { 
      id: true,
      title: true,
    },
  });

  if (!admin) redirect("/dashboard/admins");

  // Fetch noticeboards
  const noticeboards = await prisma.noticeboard.findMany({
    where: {
      adminId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get stats
  const stats = {
    total: noticeboards.length,
    published: noticeboards.filter((n) => n.isPublished).length,
    draft: noticeboards.filter((n) => !n.isPublished).length,
  };

  return (
    <NoticeboardsClient
      noticeboards={noticeboards}
      stats={stats}
      adminId={adminId}
      adminTitle={admin.title}
    />
  );
}
