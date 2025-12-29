import { getTutor } from "@/actions/get-tutor";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CourseEnrollButton from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { BookOpen, File } from "lucide-react";
import { VideoPlayer } from "./_components/video-player";
import { CourseProgressButton } from "./_components/course-progress-button";

const TutorIdPage = async ({
  params,
}: {
    params: Promise<{ adminId: string; courseId: string; tutorId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const resolvedParams = await params;
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
    tutorId: resolvedParams.tutorId,
    courseId: resolvedParams.courseId,
    adminId: resolvedParams.adminId,
  });

  if (!tutorial || !course) {
    return redirect("/");
  }

  const isLocked = !tutorial.isFree && !tuition;
  const completeOnEnd = !!tuition && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner
          variant={"success"}
          label="You already completed this Tutor."
        />
      )}
      {isLocked && (
        <Banner
          variant={"warning"}
          label="You need to pay for this Course to watch this Tutor."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            tutorialId={resolvedParams.tutorId}
            title={tutorial.title}
            courseId={resolvedParams.courseId}
            nextTutorialId={nextTutorial?.id ?? ""}
            playbackId={muxData?.playbackId ?? ""}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{tutorial.title}</h2>
            {tuition ? (
              <CourseProgressButton
                tutorialId={resolvedParams.tutorId}
                courseId={resolvedParams.courseId}
                nextTutorialId={nextTutorial?.id ?? ""}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={resolvedParams.courseId}
                amount={course.amount ?? ""}
              />
            )}
          </div>
          <Separator />          
          <div>
            <Preview value={tutorial.description} />  
          </div>
          {!!assignments.length && (
            <>
              <Separator />
              <div className="p-4">
                {assignments.map((assignment) => (
                  <a
                    href={assignment.description ?? ""}
                    target="_blank"
                    key={assignment.title}
                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <BookOpen />
                    <p className="line-clamp-1">{assignment.title}</p>
                  </a>
                ))}
              </div>
            </>
          )}
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url ?? ""}
                    target="_blank"
                    key={attachment.url}
                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.url}</p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorIdPage;
