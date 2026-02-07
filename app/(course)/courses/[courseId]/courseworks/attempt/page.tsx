import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    courseId: string;
    courseworkId: string;
  };
}

export default async function CourseworkAttemptPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const { courseId, courseworkId } = params;

  const coursework = await prisma.coursework.findFirst({
    where: {
      id: courseworkId,
      courseId,
      isPublished: true,
      course: {
        isPublished: true,
      },
    },
    include: {
      attachments: true,
      courseworkSubmissions: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (!coursework) {
    return redirect(`/courses/${courseId}/courseworks`);
  }

  const submission = coursework.courseworkSubmissions[0] ?? null;

  // --- render UI below ---
}
