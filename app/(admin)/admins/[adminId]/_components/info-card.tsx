// app/(admin)/admins/[adminId]/_components/info-card.tsx
'use client'

import { IconBadge } from "@/components/icon-badge";
import * as LucideIcons from "lucide-react";

interface InfoCardProps {
  iconName: keyof typeof LucideIcons;
  label: string;
  numberOfItems: number;
  variant?: "default" | "success";
  singular?: string;
  plural?: string;
}

export default function InfoCard({
  iconName,
  label,
  numberOfItems,
  variant = "default",
  singular = "item",
  plural = "items",
}: InfoCardProps) {
  // Safely get the icon component (with fallback)
  const Icon = LucideIcons[iconName] as LucideIcons.LucideIcon || LucideIcons.HelpCircle;

  const itemText = numberOfItems === 1 ? singular : plural;

  return (
    <div className="border rounded-lg flex items-center gap-x-4 p-4 bg-white shadow-sm hover:shadow transition-shadow">
      <IconBadge variant={variant} icon={Icon} />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {numberOfItems} {itemText}
        </p>
      </div>
    </div>
  );
}