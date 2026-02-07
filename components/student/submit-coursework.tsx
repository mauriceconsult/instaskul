// components/student/submit-coursework.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle } from "lucide-react";

interface SubmitCourseworkProps {
  courseworkId: string;
  existingSubmission?: {
    id: string;
    text: string | null;
    fileUrl: string | null;
  } | null;
}

export function SubmitCoursework({ 
  courseworkId, 
  existingSubmission 
}: SubmitCourseworkProps) {
  const [content, setContent] = useState(existingSubmission?.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please provide your submission");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/courseworks/${courseworkId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit coursework");
      }

      toast.success(existingSubmission ? "Coursework updated successfully!" : "Coursework submitted successfully!");
      setIsSubmitted(true);
      
      // Refresh the page to show updated submission
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit coursework. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {existingSubmission ? "Submission Updated!" : "Coursework Submitted!"}
        </h3>
        <p className="text-slate-600 mb-6">
          Your instructor will review your submission.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          View Submission
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="coursework-content">
          {existingSubmission ? "Update Your Submission" : "Your Submission"}
        </Label>
        <Textarea
          id="coursework-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your coursework submission here. You can include:
• Your answers and explanations
• Links to external documents (Google Docs, GitHub, etc.)
• Code snippets or solutions
• Any additional notes or comments"
          rows={12}
          className="resize-y"
          disabled={isSubmitting}
        />
        <p className="text-xs text-slate-500">
          Tip: You can paste links to documents, code repositories, or other resources
        </p>
      </div>

      {/* File Upload Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Upload className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Need to upload files?</p>
            <p>
              Upload your files to{" "}
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Google Drive
              </a>{" "}
              or{" "}
              <a
                href="https://dropbox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Dropbox
              </a>
              , then paste the share link above.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {existingSubmission ? "Updating..." : "Submitting..."}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {existingSubmission ? "Update Submission" : "Submit Coursework"}
          </>
        )}
      </Button>
    </form>
  );
}
