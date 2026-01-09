// app/(course)/courses/[courseId]/tutors/[tutorId]/_components/course-enroll-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/format";
import { useState } from "react";

interface CourseEnrollButtonProps {
  courseId: string;
  amount: string;
}

export default function CourseEnrollButton({
  courseId,
  amount,
}: CourseEnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = () => {
    setIsLoading(true);
    console.log("Navigating to:", `/courses/${courseId}/checkout`); // Debug log
    router.push(`/courses/${courseId}/checkout`);
  };

  return (
    <Button
      disabled={isLoading}
      size="sm"
      onClick={onClick}
      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
    >
      Enroll for {formatAmount(amount)}
    </Button>
  );
}