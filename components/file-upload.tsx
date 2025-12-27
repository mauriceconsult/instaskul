"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/server/uploadthing";
import toast from "react-hot-toast";

interface FileUploadProps {
  endpoint: keyof OurFileRouter;
  onChange?: (url: string) => void;
}

export function FileUpload({ endpoint, onChange }: FileUploadProps) {
  return (
    <UploadButton<OurFileRouter, keyof OurFileRouter>
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        console.log("Upload complete!", res);
        if (res?.[0]?.url) {
          onChange?.(res[0].url);
        }
      }}
      onUploadError={(err) => {
        console.error("Upload failed:", err);
        toast.error("Upload failed: " + err.message);
      }}
    />
  );
}