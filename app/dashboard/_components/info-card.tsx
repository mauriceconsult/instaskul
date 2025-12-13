'use client'

import { IconBadge } from "@/components/icon-badge";
import * as Icons from "lucide-react";

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  iconName: string;  // Changed from LucideIcon to string
  singular?: string;
  plural?: string;
}

const InfoCard = ({
  variant = "default",
  iconName,
  label,
  numberOfItems,
  singular = "item",
  plural = "items",
}: InfoCardProps) => {
  const itemText = numberOfItems === 1 ? singular : plural;
  
  // Get the icon component from the icon name
  const Icon = (Icons as any)[iconName] as Icons.LucideIcon;

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