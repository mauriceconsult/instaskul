"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import qs from "query-string";
import { useDebounce } from "@/hooks/use-debounce.js";
import { usePathname, useRouter } from "next/navigation.js";
import { Input } from "@/components/ui/input";

interface NoticeboardSearchInputProps {
  adminId?: string;
  noticeboardId?: string;
  
}
export const NoticeboardSearchInput = ({ adminId, noticeboardId }: NoticeboardSearchInputProps) => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          adminId, 
          noticeboardId,
          title: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  }, [debouncedValue, adminId, router, pathname]);

  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Search admin notices ..."
      />
    </div>
  );
};
