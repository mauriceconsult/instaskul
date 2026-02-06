// app/admins/[adminId]/noticeboards/[noticeboardId]/page.tsx

import { getNoticeboard } from "@/actions/get-noticeboard";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File } from "lucide-react";

const NoticeboardIdPage = async ({
  params,
}: {
  params: { adminId: string; noticeboardId: string };
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, noticeboardId } = params;

  const noticeboardData = await getNoticeboard({
    userId,
    adminId,
    noticeboardId,
  });

  if (!noticeboardData?.noticeboard) {
    redirect(`/admins/${adminId}`);
  }

  const { noticeboard, attachments } = noticeboardData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900">
        {noticeboard.title}
      </h1>

      {/* Description */}
      {noticeboard.description && (
        <Preview value={noticeboard.description} />
      )}

      {/* Attachments */}
      {!!attachments.length && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-md bg-sky-50 border border-sky-200 text-sky-700 hover:underline"
                >
                  <File className="h-5 w-5" />
                  <span className="line-clamp-1">
                    {attachment.url ?? "Attachment"}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NoticeboardIdPage;
