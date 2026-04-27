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
import { Admin } from "@prisma/client";

interface AdminImageFormProps {
  initialData: Admin;
  adminId: string;
}

const formSchema = z.object({
  imageUrl: z.string().min(1),
});

export const AdminImageForm = ({
  initialData,
  adminId,
}: AdminImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const hasImage = !!initialData.imageUrl;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/admins/${adminId}/images`, values);
      toast.success("Admin updated.");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  };

  // Build prompt from whatever fields Admin has — adjust field names to match your schema
  const aiPrompt = [
    "Generate a professional, high-quality cover image for an educational admin profile",
    "name" in initialData && initialData.name
      ? `named "${initialData.name}"`
      : null,
    ". Style: clean, modern, suitable for an online learning platform.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Admin cover image*
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
              alt="Admin cover"
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
