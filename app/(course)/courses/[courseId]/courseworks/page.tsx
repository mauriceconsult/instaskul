// app/courses/[courseId]/courseworks/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const CourseworksPage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const courseworks = await prisma.coursework.findMany({
    where: {
      courseId: params.courseId,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Courseworks</h1>

      {courseworks.map((cw) => (
        <Link
          key={cw.id}
          href={`/courses/${params.courseId}/courseworks/${cw.id}`}
          className="block p-4 border rounded-lg hover:bg-slate-50"
        >
          <p className="font-medium">{cw.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default CourseworksPage;
