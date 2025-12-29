import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; courseId: string }>;
}) => {
  const { adminId, courseId } = await params; 

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      adminId, 
    },
    include: {
      courseworks: true,
      courseNoticeboards: true,
      tutors: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/dashboard");
  }

  // Redirect to first tutorial if available
  if (course.tutors.length > 0) {
    return redirect(`/admins/${adminId}/courses/${course.id}/tutors/${course.tutors[0].id}`);
  }

  // If no tutorials, stay on course page
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-slate-600 mt-2">No tutorials available yet.</p>
    </div>
  );
};

export default CourseIdPage;