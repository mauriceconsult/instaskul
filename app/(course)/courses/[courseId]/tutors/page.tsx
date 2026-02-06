// app/courses/[courseId]/tutors/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const TutorsPage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const course = await prisma.course.findUnique({
    where: { id: params.courseId, isPublished: true },
    include: {
      tutors: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) redirect("/dashboard/search");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Tutorials</h1>

      {course.tutors.map((tutor) => (
        <Link
          key={tutor.id}
          href={`/courses/${course.id}/tutors/${tutor.id}`}
          className="block p-4 border rounded-lg hover:bg-slate-50"
        >
          <p className="font-medium">{tutor.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default TutorsPage;
