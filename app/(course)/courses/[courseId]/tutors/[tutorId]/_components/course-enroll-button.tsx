"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/format";
import toast from "react-hot-toast";
import { useState } from "react";


interface CourseEnrollButtonProps {
  courseId: string;
  amount: string;
}

export default function CourseEnrollButton({
  courseId,
  amount,
}: CourseEnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const onClick = async () => {
    try {
      setIsLoading(true);
      router.push(`/courses/${courseId}/checkout`)
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }
  const router = useRouter();

  return (
    <Button
      disabled={isLoading}
      size={"sm"}
      onClick={onClick}
      // onClick={() => router.push(`/courses/${courseId}/checkout`)}
      className="w-full md:w-auto"
    >
      Enroll for {formatAmount(amount)}
    </Button>
  );
}