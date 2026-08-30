"use client";

import { useState } from "react";
import { useAuth }  from "@clerk/nextjs";

export default function JournalPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { isSignedIn } = useAuth();
  const [phase,      setPhase]      = useState<"idle"|"generating"|"ready"|"submitting"|"done">("idle");
  const [articleUrl, setArticleUrl] = useState<string | null>(null);
  const [wordCount,  setWordCount]  = useState<number | null>(null);
  const [error,      setError]      = useState("");

  const generate = async () => {
    setPhase("generating"); setError("");

    const res  = await fetch(`/api/courses/${params.courseId}/journal/generate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({}), // context comes from journal.context in DB, not user input
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Generation failed"); setPhase("idle"); return; }

    setArticleUrl(data.articleUrl);
    setWordCount(data.wordCount);
    setPhase("ready");
  };

  const submit = async () => {
    setPhase("submitting");
    const res = await fetch(`/api/courses/${params.courseId}/journal/submit`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (res.ok) setPhase("done");
    else { setError(data.error ?? "Submission failed"); setPhase("ready"); }
  };

  if (!isSignedIn) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Journal</h1>
      <p className="text-sm text-gray-500 mb-8">
        Generate a peer-review-ready academic article based on this course's
        content and context. Once generated, submit it for platform review.
        Approved articles are published publicly as a quality indicator for
        this course.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {phase === "idle" && (
        <button
          onClick={generate}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Generate Journal Article
        </button>
      )}

      {phase === "generating" && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Generating article — this takes 30–60 seconds…
          </p>
        </div>
      )}

      {(phase === "ready" || phase === "submitting" || phase === "done") && articleUrl && (
        <div className="p-5 bg-green-50 rounded-xl border border-green-100 space-y-4">
          <div>
            <p className="text-sm font-semibold text-green-800">
              Article generated — {wordCount?.toLocaleString()} words
            </p>
            <p className="text-xs text-green-600 mt-1">
              Review the article before submitting for platform approval.
            </p>
          </div>
          
          <a
            href={articleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 underline"
          >
            Download Article (.docx)
          </a>
          {phase === "ready" && (
            <>
              <button
                onClick={generate}
                className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={submit}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                Submit for Platform Review
              </button>
            </>
          )}
          {phase === "submitting" && (
            <p className="text-sm text-gray-500">Submitting…</p>
          )}
          {phase === "done" && (
            <p className="text-sm font-semibold text-green-700">
              ✓ Submitted — the platform admin will review and approve for publication.
            </p>
          )}
        </div>
      )}
    </div>
  );
}