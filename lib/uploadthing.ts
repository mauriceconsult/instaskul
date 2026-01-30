// lib/uploadthing.ts
import { generateComponents } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate typed components
export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();
