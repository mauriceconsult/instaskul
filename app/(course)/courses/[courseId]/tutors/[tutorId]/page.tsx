import { getTutor } from "@/actions/get-tutor";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const TutorIdPage = async ({
  params,
}: {
  params: Promise<{ courseId: string; tutorId: string }>; // ← No adminId
}) => {
  const { userId } = await auth();
  
  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId, tutorId } = await params;

  const {
    tutorial,
    course,
    muxData,
    assignments,
    attachments,
    nextTutorial,
    userProgress,
    tuition,
  } = await getTutor({
    userId,
    courseId,
    tutorId,
  });

  if (!tutorial || !course) {
    return redirect(`/courses/${courseId}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{tutorial.title}</h1>
      {/* render video, assignments, etc */}
    </div>
  );
};

export default TutorIdPage;
