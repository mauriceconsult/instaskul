"use client";

/**
 * src/components/studio-ai.tsx  (Instaskul)
 * Added: "video" generation type → routes to /videos in Studio
 */

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type StudioGenerationType =
  | "description"
  | "image"
  | "video"       // ← added
  | "script"
  | "captions"
  | "headline";

export interface StudioAIOptions {
  type: StudioGenerationType;
  prompt: string;
  onResult?: (value: string) => void;
}

const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "http://localhost:3000";

const TYPE_ROUTE: Record<StudioGenerationType, string> = {
  image:       "/image-generations",
  video:       "/videos",             // ← added
  description: "/text-generations",
  headline:    "/text-generations",
  script:      "/text-generations",
  captions:    "/text-generations",
};

export async function openStudioAI(
  options: StudioAIOptions,
  router: ReturnType<typeof useRouter>
): Promise<void> {
  let token: string;
  try {
    const res = await fetch("/api/studio/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown" }));
      throw new Error(error);
    }
    token = (await res.json()).token;
  } catch (err) {
    console.error("[StudioAI] Failed to mint token:", err);
    window.open(STUDIO_URL, "_blank");
    return;
  }

  const params = new URLSearchParams({
    token,
    prompt:   options.prompt,
    type:     options.type,
    returnTo: window.location.pathname,
  });

  router.push(`${STUDIO_URL}/auth/cross?${params.toString()}`);
}

interface StudioAIButtonProps {
  options: StudioAIOptions;
  variant?: "inline" | "block";
  className?: string;
}

export function StudioAIButton({
  options,
  variant = "inline",
  className,
}: StudioAIButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const LABELS: Record<StudioGenerationType, string> = {
    description: "Generate with Studio AI",
    image:       "Generate cover with Studio AI",
    video:       "Generate video with Studio AI",  // ← added
    script:      "Draft script in Studio AI",
    captions:    "Write captions in Studio AI",
    headline:    "Suggest headline in Studio AI",
  };

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await openStudioAI(options, router);
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "block") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5",
          "border border-dashed border-border",
          "bg-muted/20 hover:bg-muted/40 hover:border-foreground",
          "transition-all group disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <span className="flex items-center gap-2">
          <Sparkles className={cn(
            "w-3 h-3 text-muted-foreground group-hover:text-foreground transition",
            isPending && "animate-pulse"
          )} />
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition">
            {isPending ? "Opening Studio…" : "Studio AI"}
          </span>
        </span>
        {!isPending && (
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition">
            {LABELS[options.type]} →
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1 font-mono text-[8px] tracking-widest uppercase",
        "text-muted-foreground hover:text-foreground transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <Sparkles className={cn(
        "w-2.5 h-2.5 flex-shrink-0",
        isPending && "animate-pulse"
      )} />
      {isPending ? "Opening…" : LABELS[options.type]}
    </button>
  );
}
