"use client";

import { useEffect, useState } from "react";

interface TutorVideoFormProps {
  initialData: {
    id: string;
    videoUrl: string | null;
    muxData: { assetId: string; playbackId: string | null } | null;
    // Other fields
  };
  adminId: string;
  courseId: string;
  tutorId: string;
}

export const TutorVideoForm = ({
  initialData,
//   adminId,
//   courseId,
//   tutorId,
}: TutorVideoFormProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Skip rendering during SSR
  }

  return (
    <div>
      {initialData.videoUrl && initialData.muxData?.playbackId ? (
        <video
          controls
          src={`https://stream.mux.com/${initialData.muxData.playbackId}.m3u8`}
        />
      ) : (
        <div>Upload a video</div>
      )}
    </div>
  );
};
