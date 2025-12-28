"use client";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, VideoIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { Tutor, MuxData } from '@prisma/client';
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
  tutorId 
}: TutorVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {     
      await axios.patch(
        `/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`,
        values
      );
      toast.success("Video uploaded! Processing may take a few minutes.");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Tutorial video*
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {!initialData.videoUrl && (
            <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
              <VideoIcon className="h-10 w-10 text-slate-500" />
            </div>
          )}
          
          {initialData.videoUrl && !initialData.muxData?.playbackId && (
            <div className="relative aspect-video mt-2 bg-slate-100 rounded-md flex items-center justify-center border-2 border-slate-300">
              <div className="text-center p-8">
                <div className="animate-pulse mb-4">
                  <VideoIcon className="h-12 w-12 text-slate-400 mx-auto" />
                </div>
                <p className="text-sm font-medium text-slate-700">Processing video...</p>
                <p className="text-xs text-slate-500 mt-2">
                  This usually takes 1-3 minutes depending on video length
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

          {initialData.muxData?.playbackId && (
            <div className="relative aspect-video mt-2">
              <MuxPlayer
                playbackId={initialData.muxData.playbackId}
                title={initialData.title || "Tutorial Video"}
                className="w-full h-full"
              />
            </div>
          )}
        </>
      )}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="tutorVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload tutorial video. Supported formats: MP4, MOV, AVI, WEBM
          </div>
        </div>
      )}

      {initialData.videoUrl && !isEditing && !initialData.muxData?.playbackId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Video processing in progress. The video player will appear once processing is complete.
          </p>
        </div>
      )}
    </div>
  );
};