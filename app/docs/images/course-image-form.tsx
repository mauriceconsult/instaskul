"use client";

import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { StudioAIButton } from "@/components/studio-ai";
import { Course } from "@prisma/client";

interface CourseImageFormProps {
  initialData: Course;
  adminId: string;
  courseId: string;
}

const formSchema = z.object({
  imageUrl: z.string().min(1),
});

export const CourseImageForm = ({
  initialData,
  adminId,
  courseId,
}: CourseImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const hasImage = !!initialData.imageUrl;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/admins/${adminId}/courses/${courseId}/images`,
        values
      );
      toast.success("Course updated.");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  };

  // Build prompt from Course fields — title and description are standard Prisma Course fields
  const aiPrompt = [
    "Generate a striking, professional cover image for an online course",
    initialData.title ? `titled "${initialData.title}"` : null,
    initialData.description
      ? `. The course covers: ${initialData.description}`
      : null,
    ". Style: modern e-learning platform, clean, engaging, 16:9 format.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course cover image*
        <div className="flex items-center gap-2">
          <StudioAIButton
            variant="inline"
            options={{ type: "image", prompt: aiPrompt }}
          />
          <Button onClick={() => setIsEditing((c) => !c)} variant="ghost">
            {isEditing ? (
              <><X className="h-4 w-4 mr-2" />Cancel</>
            ) : !hasImage ? (
              <><PlusCircle className="h-4 w-4 mr-2" />Add image</>
            ) : (
              <><Pencil className="h-4 w-4 mr-2" />Edit image</>
            )}
          </Button>
        </div>
      </div>

      {!isEditing && (
        !hasImage ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md mt-2">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt="Course cover"
              fill
              className="object-cover rounded-md"
              src={initialData.imageUrl!}
            />
          </div>
        )
      )}

      {isEditing && (
        <div className="mt-2">
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => { if (url) onSubmit({ imageUrl: url }); }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}

      {!isEditing && !hasImage && (
        <StudioAIButton
          variant="block"
          className="mt-3"
          options={{ type: "image", prompt: aiPrompt }}
        />
      )}
    </div>
  );
};
