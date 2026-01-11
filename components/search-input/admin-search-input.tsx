"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import qs from "query-string";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface AdminSearchInputProps {
  adminId?: string;
}

export const AdminSearchInput = ({ adminId }: AdminSearchInputProps) => {
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
          title: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  }, [debouncedValue, adminId, router, pathname]);

  return (
    <div className="relative w-full">
      <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Search for admins..."
      />
    </div>
  );
};