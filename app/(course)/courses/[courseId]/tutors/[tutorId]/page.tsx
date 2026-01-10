// app/courses/[courseId]/tutorials/[tutorId]/page.tsx

import { getTutor } from "@/actions/get-tutor";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Banner } from "@/components/banner";
import { VideoPlayer } from "./_components/video-player";
import CourseEnrollButton from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { Progress } from "@/components/ui/progress"; 
import { File, CheckCircle } from "lucide-react";

const TutorIdPage = async ({
  params,
}: {
  params: Promise<{ courseId: string; tutorId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const { courseId, tutorId } = await params;

  const {
    tutorial,
    course,
    muxData,
    attachments,
    nextTutorial,
    userProgress,
    tuition,
    assignmentProgress = 0, // ← Destructure with default
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
      {/* Existing banners */}
      {userProgress?.isCompleted && (
        <Banner variant="success" label="You already completed this tutorial." />
      )}
      {isLocked && (
        <Banner variant="warning" label="You need to enroll to access this tutorial." />
      )}

      {/* Video Player */}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            tutorialId={tutorId}
            title={tutorial.title}
            courseId={courseId}
            nextTutorialId={nextTutorial?.id}
            playbackId={muxData?.playbackId || ""}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
      </div>

      {/* Title + Progress / Enroll */}
      <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{tutorial.title}</h2>

        {tuition ? (
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Assignment Progress */}
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Assignments</p>
                <Progress value={assignmentProgress} className="h-2 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {assignmentProgress}% completed
                </p>
              </div>
            </div>       
          </div>
        ) : (
          <CourseEnrollButton courseId={courseId} amount={course.amount} />
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="p-4">
        <Preview value={tutorial.description || ""} />
      </div>

      {/* Attachments */}
      {!!attachments.length && (
        <>
          <Separator />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            {attachments.map((attachment) => (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                key={attachment.id}
                className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline mb-2"
              >
                <File className="h-5 w-5 mr-3" />
                <p className="line-clamp-1">{attachment.url || "Attachment"}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TutorIdPage;