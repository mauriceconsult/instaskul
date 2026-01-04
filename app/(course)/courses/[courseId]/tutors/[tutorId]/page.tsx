import { getTutor } from "@/actions/get-tutor";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Banner } from "@/components/banner";
import { VideoPlayer } from "./_components/video-player";
import CourseEnrollButton from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File } from "lucide-react";

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
  const isLocked = !tutorial.isFree && !tuition;
  const completeOnEnd = !!tuition && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress && (
        <Banner
          variant={"success"}
          label="You already completed this tutorial."
        />)}
      {isLocked && (
        <Banner
          variant={"warning"}
          label="You need to enroll in this tutorial."
        />)}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            tutorialId={(await params).tutorId}
            title={tutorial.title}
            courseId={(await params).courseId}
            nextTutorialId={nextTutorial?.id}
            playbackId={muxData?.playbackId || ""}
            isLocked={isLocked}            
            completeOnEnd={completeOnEnd}
          />
        </div>
      </div>
      <div className="p-4 flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold mb-2">
          {tutorial.title}
        </h2>
        {tuition ? (
          <div>{/* Add progress button*/}</div>
        ) : (
            <CourseEnrollButton
              courseId={(await params).courseId}
              amount={course.amount}
            />
        )}
      </div>
      <Separator />
      <div>
        <Preview
          value={tutorial.description}
        />
      </div>
      {!!attachments.length && (
        <>
          <Separator />
          <div className="p-4">
            {attachments.map((attachment) => (
              <a href={attachment.url}
                target="_blank"
                key={attachment.id}
                className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
              >
                <File/>
                <p className="line-clamp-1">
                  {attachment.tutorId}
                </p>

              </a>
            ))}

          </div>
        </>
      )}
    </div>
  );
};

export default TutorIdPage;
