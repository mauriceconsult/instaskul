"use client";

import { School } from "@prisma/client";
import {
  FcEngineering,
  FcReadingEbook,
  FcLibrary,
  FcMoneyTransfer,
  FcBiotech,
  FcGoodDecision,
  FcSportsMode,
} from "react-icons/fc";
import { IconType } from "react-icons";
import { SchoolItem } from "./school-item";

interface SchoolsProps {
    items: School[];
}
const iconMap: Record<School["name"], IconType> = {
  "Engineering & Technology": FcEngineering,
  "Arts & Humanities": FcReadingEbook,
  "Social Sciences": FcLibrary,
  "Natural Sciences": FcBiotech,
  "Business & Management": FcMoneyTransfer,
  "Health Sciences": FcGoodDecision,
  "Sports & Fitness": FcSportsMode,
};
export const Schools = ({
items,
}: SchoolsProps) => {
    return (
      <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
        {items.map((item) => (
          <SchoolItem
            key={item.id}
            label={item.name}
            icon={iconMap[item.name]}
            value={item.id}
          />
        ))}
      </div>
    );
}
