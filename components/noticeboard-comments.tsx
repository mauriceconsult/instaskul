// components/noticeboard-comments.tsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  userName?: string;
  replies?: Comment[];
}

interface NoticeboardCommentsProps {
  noticeboardId: string;
  initialComments: Comment[];
  type: "noticeboard" | "coursenoticeboard";
}

export function NoticeboardComments({
  noticeboardId,
  initialComments,
  type,
}: NoticeboardCommentsProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const endpoint = type === "noticeboard" 
        ? `/api/noticeboards/${noticeboardId}/comments`
        : `/api/coursenoticeboards/${noticeboardId}/comments`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const comment = await response.json();
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const endpoint = type === "noticeboard"
        ? `/api/noticeboards/${noticeboardId}/comments`
        : `/api/coursenoticeboards/${noticeboardId}/comments`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: replyContent,
          parentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to post reply");

      const reply = await response.json();
      
      // Update comments with new reply
      setComments(comments.map(comment => 
        comment.id === parentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));

      setReplyContent("");
      setReplyingTo(null);
      toast.success("Reply posted!");
    } catch (error) {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="bg-slate-50 border rounded-xl p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-600">Sign in to view and post comments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h3>

        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="bg-white border rounded-xl p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-xl p-6">
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(comment.userName || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {comment.userName || "Anonymous"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-slate-700 mb-3 ml-12">{comment.content}</p>

              {/* Reply Button */}
              <div className="ml-12">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-12 mt-3 p-4 bg-slate-50 rounded-lg">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
                      )}
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {getInitials(reply.userName || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">
                              {reply.userName || "Anonymous"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 mt-1">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
