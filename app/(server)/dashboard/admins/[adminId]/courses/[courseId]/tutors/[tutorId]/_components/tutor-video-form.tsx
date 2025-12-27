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
      // Fixed: removed /videos from the end
      await axios.patch(
        `/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`,
        values
      );
      toast.success("Tutorial updated.");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium text-sm flex items-center justify-between">
        Tutorial video (at least one tutorial is required)*
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add tutorial video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit tutorial video
            </>
          )}
        </Button>
      </div>

      {!isEditing && !initialData.videoUrl && (
        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
          <VideoIcon className="h-10 w-10 text-slate-500" />
        </div>
      )}

      {!isEditing && initialData.videoUrl && (
        <div className="relative aspect-video mt-2">
          <p className="text-sm text-slate-600">Video uploaded</p>
          {initialData.muxData?.playbackId && (
            <div className="text-xs text-muted-foreground mt-2">
              Playback ID: {initialData.muxData.playbackId}
            </div>
          )}
        </div>
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
            Upload a tutorial video. Supported formats: MP4, MOV, AVI
          </div>
        </div>
      )}

      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process after uploading. 
          If you don't see the video right away, please check back shortly or refresh the page.
        </div>
      )}
    </div>
  );
};