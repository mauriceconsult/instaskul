"use client";

import { School } from "@prisma/client";
import {
  FcNews,
  FcTwoSmartphones,
  FcConferenceCall,
  FcMusic,
  FcNightPortrait,  
  FcRules,
  FcSportsMode,
} from "react-icons/fc";
import { IconType } from "react-icons";
import { SchoolItem } from "./school-item";

interface SchoolsProps {
  items: School[];
}
const iconMap: Record<School["name"], IconType> = {
  "Engineering & Technology": FcNews,
  "Arts & Humanities": FcTwoSmartphones,
  "Social Sciences": FcConferenceCall,
  "Natural Sciences": FcMusic,
  "Business & Management": FcNightPortrait,
    "Sports & Fitness": FcRules,
    "Education": FcSportsMode,
  
};
export const Schools = ({ items }: SchoolsProps) => {
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
};
