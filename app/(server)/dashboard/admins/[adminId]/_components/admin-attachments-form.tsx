"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, File, Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { Attachment } from "@prisma/client";
import axios from "axios";

interface AdminAttachmentsFormProps {
  initialData: { attachments: Attachment[] };
  adminId: string;
}

export const AdminAttachmentsForm = ({ initialData, adminId }: AdminAttachmentsFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (url: string) => {
    try {
      await axios.post(`/api/admins/${adminId}/attachments`, { url });
      toast.success("Attachment added");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/admins/${adminId}/attachments/${id}`);
      toast.success("Attachment removed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Admin attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {initialData.attachments.length === 0 ? (
            <p className="text-sm mt-2 text-slate-500 italic">No attachments yet</p>
          ) : (
            <div className="space-y-2 mt-4">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                >
                  <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm line-clamp-1 hover:underline"
                  >
                    {attachment.url.split("/").pop()}
                  </a>
                  <button
                    onClick={() => onDelete(attachment.id)}
                    disabled={deletingId === attachment.id}
                    className="ml-auto hover:opacity-75 transition"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isEditing && (
        <div className="mt-4">
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url) => {
              if (url) onSubmit(url);
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload supporting documents or resources (PDFs, images, etc.).
          </div>
        </div>
      )}
    </div>
  );
};