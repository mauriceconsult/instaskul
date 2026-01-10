"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/format";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface CourseEnrollButtonProps {
  courseId: string;
  amount: string | number; // Accept both (DB string, formatted number)
}

export default function CourseEnrollButton({
  courseId,
  amount,
}: CourseEnrollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;

  const handleEnroll = () => {
    startTransition(() => {
      setError(null);
      router.push(`/courses/${courseId}/checkout`);
    });
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleEnroll}
        disabled={isPending}
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>Enroll for {formatAmount(amount)}</>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}