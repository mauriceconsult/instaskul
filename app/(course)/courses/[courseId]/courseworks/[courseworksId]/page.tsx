// app/courses/[courseId]/courseworks/[courseworkId]/page.tsx
import { getCoursework } from "@/actions/get-coursework";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { Progress } from "@/components/ui/progress";
import { File, CheckCircle } from "lucide-react";

export default async function CourseworkIdPage({
  params,
}: {
  params: Promise<{ courseId: string; courseworkId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { courseId, courseworkId } = await params;

  const data = await getCoursework({
    userId,
    courseId,
    courseworkId,
  });

  const {
    courseworkProgress = 0,
    attachments = [],
    userProgress,
  } = data;

  const coursework = data;
  const course = data;

  if (!coursework || !course) {
    redirect(`/courses/${courseId}`);
  }

  const isLocked = !coursework && !userProgress?.isEnrolled;
  const completeOnEnd = !!userProgress?.isEnrolled && !userProgress?.isCompleted;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banners */}
      {userProgress?.isCompleted && (
        <Banner variant="success" label="You have already completed this coursework." />
      )}
      {isLocked && (
        <Banner variant="warning" label="You need to enroll in the course to access this coursework." />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header: Title + Progress */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">{coursework.title}</h1>

          {!isLocked && courseworkProgress > 0 && (
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-lg shadow-sm border">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Progress</p>
                <div className="flex items-center gap-3 mt-1">
                  <Progress value={courseworkProgress} className="h-2 w-32" />
                  <span className="text-sm font-semibold text-green-700">
                    {courseworkProgress}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Description */}
        <div className="prose prose-slate max-w-none mb-10">
          <Preview value={coursework.description || "No description provided."} />
        </div>

        {/* Attachments / Resources */}
        {!!attachments.length && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <File className="h-5 w-5 text-sky-600" />
              Resources & Materials
            </h3>
            <div className="grid gap-3">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors group"
                >
                  <File className="h-5 w-5 text-sky-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sky-800 group-hover:text-sky-900 truncate">
                      {attachment.url || attachment.url.split("/").pop() || "Attachment"}
                    </p>
                    <p className="text-xs text-sky-600 mt-0.5">
                      Click to download / view
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}