/**
 * components/launcher/StudioLauncher.tsx
 * "Open in Studio" button for instaskul.
 * Mints a cross-app session token via manager then redirects to studio.
 *
 * Usage:
 *   <StudioLauncher />                          // standalone button
 *   <StudioLauncher courseId="abc" />           // passes context to studio
 *   <StudioLauncher label="Generate content" /> // custom label
 */

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface StudioLauncherProps {
  courseId?: string;
  label?: string;
  className?: string;
}

export function StudioLauncher({
  courseId,
  label = "Open in Studio",
  className,
}: StudioLauncherProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/launcher/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to launch Studio");
      }

      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleLaunch}
        disabled={loading || !user}
        className={className ?? "inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"}
      >
        {loading ? (
          <>
            <Spinner />
            Launching…
          </>
        ) : (
          <>
            <StudioIcon />
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

function StudioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
      <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
      <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}
