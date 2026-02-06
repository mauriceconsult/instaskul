// app/courses/[courseId]/coursenoticeboards/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const CourseNoticeboardsPage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const noticeboards = await prisma.courseNoticeboard.findMany({
    where: {
      courseId: params.courseId,
      isPublished: true,
    },
    orderBy: { position: "asc" },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Course Notices</h1>

      {noticeboards.map((nb) => (
        <Link
          key={nb.id}
          href={`/courses/${params.courseId}/coursenoticeboards/${nb.id}`}
          className="block p-4 border rounded-lg hover:bg-slate-50"
        >
          <p className="font-medium">{nb.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default CourseNoticeboardsPage;
