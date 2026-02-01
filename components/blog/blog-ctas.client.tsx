"use client";

import Link from "next/link";

type BlogCTAsClientProps = {
  postUrl: string;
};

export function BlogCTAsClient({ postUrl }: BlogCTAsClientProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <p className="font-medium text-slate-900">
          Are you an educator or course creator?
        </p>

        <Link
          href="/sign-up?role=educator&source=blog"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Teaching on InstaSkul
        </Link>
      </div>
    </div>
  );
}
