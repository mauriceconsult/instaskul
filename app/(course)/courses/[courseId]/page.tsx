import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { userId } = await auth();
  
  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      tutors: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    return redirect("/dashboard/search");
  }

  // Redirect to first tutorial if available
  if (course.tutors.length > 0) {
    return redirect(`/courses/${courseId}/tutors/${course.tutors[0].id}`);
  }

  // If no tutorials, show fallback
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-slate-600 mt-2">No tutorials available yet.</p>
    </div>
  );
};

export default CourseIdPage;