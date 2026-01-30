// lib/uploadthing-blog.ts
// Separate client for blog to avoid conflicts with existing course upload components

import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/server/uploadthing";

export const BlogUploadButton = generateUploadButton<OurFileRouter>();
export const BlogUploadDropzone = generateUploadDropzone<OurFileRouter>();
