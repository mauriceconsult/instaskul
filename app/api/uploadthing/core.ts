import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create UploadThing instance
const f = createUploadthing();

// Auth function with proper async handling
const handleAuth = async () => {
  const { userId } = await auth();
  console.log("UploadThing auth check:", { userId });
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", { metadata, file });
      return { uploadedBy: metadata.userId, url: file.url }; // ✅ Return data!
    }),
    
  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", { metadata, file });
      return { uploadedBy: metadata.userId, url: file.url }; // ✅ Return data!
    }),
    
  tutorVideo: f({ video: { maxFileCount: 1, maxFileSize: "512GB" } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", { metadata, file });
      return { uploadedBy: metadata.userId, url: file.url }; // ✅ Return data!
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;