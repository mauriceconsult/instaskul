"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminNoticeboardFormProps {
  initialData: {
    noticeboards: { id: string; title: string; isPublished: boolean }[];
  };
  adminId: string;
}

export const AdminNoticeboardForm = ({
  initialData,
  adminId,
}: AdminNoticeboardFormProps) => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-700">
        Add and manage notices for this Admin Direct. Notices are optional but
        can enhance communication.
      </div>
      {initialData.noticeboards.length === 0 ? (
        <div className="text-sm text-slate-500 italic">
          No notices added yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {initialData.noticeboards.map((noticeboard) => (
            <li
              key={noticeboard.id}
              className="flex items-center justify-between p-2 border rounded-md bg-white"
            >
              <span>{noticeboard.title}</span>
              <Link
                href={`/admin/create-admin/${adminId}/noticeboard/${noticeboard.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                <Button variant="ghost" size="sm">
                  Edit{" "}
                  {noticeboard.isPublished ? "(Published)" : "(Unpublished)"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button
        onClick={() =>
          router.push(`/admin/create-admin/${adminId}/noticeboard/new`)
        }
        variant="outline"
        size="sm"
      >
        Add Notice
      </Button>
    </div>
  );
};
