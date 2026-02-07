// app/admins/[adminId]/noticeboards/_components/noticeboards-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bell, Eye, EyeOff, Edit, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Noticeboard {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NoticeboardsClientProps {
  noticeboards: Noticeboard[];
  stats: {
    total: number;
    published: number;
    draft: number;
  };
  adminId: string;
  adminTitle: string;
}

export default function NoticeboardsClient({
  noticeboards: initialNoticeboards,
  stats: initialStats,
  adminId,
  adminTitle,
}: NoticeboardsClientProps) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [noticeboards, setNoticeboards] = useState(initialNoticeboards);
  const [stats, setStats] = useState(initialStats);

  const filteredNoticeboards = noticeboards.filter((notice) => {
    if (filter === "published") return notice.isPublished;
    if (filter === "draft") return !notice.isPublished;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/noticeboards/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      // Update local state
      setNoticeboards((prev) => prev.filter((n) => n.id !== deleteId));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));

      toast.success("Announcement deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-slate-600 mt-1">
            Manage announcements for {adminTitle}
          </p>
        </div>
        <Link href={`/admin/admins/${adminId}/noticeboards/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Bell className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Published</p>
              <p className="text-3xl font-bold mt-1">{stats.published}</p>
            </div>
            <Eye className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Drafts</p>
              <p className="text-3xl font-bold mt-1">{stats.draft}</p>
            </div>
            <EyeOff className="h-10 w-10 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filter === "published" ? "default" : "outline"}
          onClick={() => setFilter("published")}
          size="sm"
        >
          Published ({stats.published})
        </Button>
        <Button
          variant={filter === "draft" ? "default" : "outline"}
          onClick={() => setFilter("draft")}
          size="sm"
        >
          Drafts ({stats.draft})
        </Button>
      </div>

      {/* Noticeboards List */}
      {filteredNoticeboards.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Bell className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No announcements {filter !== "all" && filter}
          </h3>
          <p className="text-slate-600 mb-6">
            {filter === "all"
              ? "Create your first announcement to keep students informed"
              : `No ${filter} announcements found`}
          </p>
          {filter === "all" && (
            <Link href={`/admin/admins/${adminId}/noticeboards/create`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNoticeboards.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-xl border p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {notice.title}
                    </h3>
                    <Badge variant={notice.isPublished ? "default" : "secondary"}>
                      {notice.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {notice.description && (
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {notice.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/admin/admins/${adminId}/noticeboards/${notice.id}`}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(notice.id)}
                  >
                    <Trash className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
