"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CourseProgressButtonProps {
  tutorialId: string;
  courseId: string;
  isCompleted?: boolean;
  nextTutorialId?: string;
}

export const CourseProgressButton = ({
  tutorialId,
  courseId,
  nextTutorialId,
  isCompleted,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Log isCompleted to debug
  useEffect(() => {
    console.log("[CourseProgressButton] isCompleted:", isCompleted);
  }, [isCompleted]);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `/api/courses/${courseId}/tutorials/${tutorialId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      );

      if (!response.data) {
        throw new Error("Failed to update progress");
      }

      toast.success(
        isCompleted
          ? "Tutorial marked as not completed."
          : "Tutorial marked as completed."
      );

      if (!isCompleted && nextTutorialId) {
        router.push(`/courses/${courseId}/tutorials/${nextTutorialId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("[CourseProgressButton]", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;
  return (
    <Button
      disabled={isLoading}
      onClick={onClick}
      type="button"
      variant={isCompleted ? "outline" : "success"}
      className="w-full md:w-auto"
    >
      {isCompleted ? "Not completed" : "Mark as complete"}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  );
};
