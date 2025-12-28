"use client";

import MuxPlayer from "@mux/mux-player-react";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  playbackId: string | null;
  courseId: string;
  tutorialId: string;
  nextTutorialId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackId,
  courseId,
  tutorialId,
  nextTutorialId,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const onEnd = async () => {
    if (!completeOnEnd) return;

    try {
      await axios.put(`/api/courses/${courseId}/tutorials/${tutorialId}/progress`, {
        isCompleted: true,
      });

      toast.success("Tutorial completed!");
      router.refresh();

      if (nextTutorialId) {
        router.push(`/courses/${courseId}/tutorials/${nextTutorialId}`);
      }
    } catch {
      toast.error("Failed to mark as complete");
    }
  };

  // Locked state
  if (isLocked) {
    return (
      <div className="relative aspect-video bg-slate-800 rounded-lg flex items-center justify-center flex-col gap-y-4 text-white">
        <Lock className="h-12 w-12" />
        <p className="text-xl font-medium">This tutorial is locked</p>
        <p className="text-sm text-center px-8">
          Complete previous tutorials to unlock this one.
        </p>
      </div>
    );
  }

  // Processing state (no playbackId yet)
  if (!playbackId) {
    return (
      <div className="relative aspect-video bg-slate-100 rounded-lg flex items-center justify-center flex-col gap-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">Processing video...</p>
          <p className="text-sm text-slate-500 mt-2">
            This may take a few minutes. Refresh to check status.
          </p>
        </div>
      </div>
    );
  }

  // Ready to play
  return (
    <div className="relative aspect-video">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-lg">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}
      <MuxPlayer
        title={title}
        playbackId={playbackId}
        onCanPlay={() => setIsReady(true)}
        onEnded={onEnd}
        autoPlay={false}
        className={cn("rounded-lg", !isReady && "hidden")}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};