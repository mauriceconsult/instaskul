"use client";

import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, VideoIcon, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { StudioAIButton } from "@/components/studio-ai";
import { Tutor, MuxData } from "@prisma/client";
import MuxPlayer from "@mux/mux-player-react";

interface TutorVideoFormProps {
  initialData: Tutor & { muxData?: MuxData | null };
  adminId: string;
  courseId: string;
  tutorId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const TutorVideoForm = ({
  initialData,
  adminId,
  courseId,
  tutorId,
}: TutorVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const hasVideo = !!initialData.videoUrl;
  const isProcessing = hasVideo && !initialData.muxData?.playbackId;
  const isReady = !!initialData.muxData?.playbackId;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`,
        values
      );
      toast.success("Video uploaded! Processing may take a few minutes.");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong.");
    }
  };

  // Build prompt from tutor/course context
  const aiPrompt = [
    "Generate a professional tutorial video script",
    initialData.title ? `for a lesson titled "${initialData.title}"` : null,
    (initialData as { description?: string | null }).description
      ? `. The lesson covers: ${(initialData as { description?: string | null }).description}`
      : null,
    ". Style: clear, engaging, educational. Suitable for an online learning platform.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Tutorial video*
        <div className="flex items-center gap-2">
          {/* Studio AI — inline button always visible */}
          <StudioAIButton
            variant="inline"
            options={{ type: "video", prompt: aiPrompt }}
          />

          <Button onClick={() => setIsEditing((c) => !c)} variant="ghost">
            {isEditing ? (
              <><X className="h-4 w-4 mr-2" />Cancel</>
            ) : !hasVideo ? (
              <><PlusCircle className="h-4 w-4 mr-2" />Add video</>
            ) : (
              <><Pencil className="h-4 w-4 mr-2" />Edit video</>
            )}
          </Button>
        </div>
      </div>

      {/* Video display */}
      {!isEditing && (
        <>
          {!hasVideo && (
            <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md mt-2">
              <VideoIcon className="h-10 w-10 text-slate-500" />
            </div>
          )}

          {isProcessing && (
            <div className="relative aspect-video mt-2 bg-slate-100 rounded-md flex items-center justify-center border-2 border-slate-300">
              <div className="text-center p-8">
                <div className="animate-pulse mb-4">
                  <VideoIcon className="h-12 w-12 text-slate-400 mx-auto" />
                </div>
                <p className="text-sm font-medium text-slate-700">Processing video...</p>
                <p className="text-xs text-slate-500 mt-2">
                  This usually takes 1–3 minutes depending on video length
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.refresh()}
                  className="mt-4"
                >
                  Refresh to check status
                </Button>
              </div>
            </div>
          )}

          {isReady && (
            <div className="relative aspect-video mt-2">
              <MuxPlayer
                playbackId={initialData.muxData!.playbackId!}
                title={initialData.title || "Tutorial Video"}
                className="w-full h-full"
              />
            </div>
          )}
        </>
      )}

      {/* Upload zone */}
      {isEditing && (
        <div className="mt-2">
          <FileUpload
            endpoint="tutorVideo"
            onChange={(url) => {
              if (url) onSubmit({ videoUrl: url });
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload tutorial video. Supported formats: MP4, MOV, AVI, WEBM
          </div>
        </div>
      )}

      {/* Processing warning */}
      {isProcessing && !isEditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Video processing in progress. The player will appear once complete.
          </p>
        </div>
      )}

      {/* Studio AI block CTA — shown when no video and not editing */}
      {!isEditing && !hasVideo && (
        <StudioAIButton
          variant="block"
          className="mt-3"
          options={{ type: "video", prompt: aiPrompt }}
        />
      )}
    </div>
  );
};
