'use client'

import { IconBadge } from "@/components/icon-badge";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
  singular?: string;  // e.g. "course" or "admin"
  plural?: string;    // e.g. "courses" or "admins"
}

const InfoCard = ({
  variant = "default",
  icon: Icon,
  label,
  numberOfItems,
  singular = "item",   // fallback
  plural = "items",
}: InfoCardProps) => {
  const itemText = numberOfItems === 1 ? singular : plural;

  return (
    <div className="border rounded-md flex items-center gap-x-2 p-3">
      <IconBadge variant={variant} icon={Icon} />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-gray-500 text-sm">
          {numberOfItems} {itemText}
        </p>
      </div>
    </div>
  );
};

export default InfoCard;