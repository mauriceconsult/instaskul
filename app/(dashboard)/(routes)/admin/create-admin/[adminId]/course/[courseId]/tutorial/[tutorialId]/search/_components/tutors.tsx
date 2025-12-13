"use client";

import { Tutor } from "@prisma/client";
import { TutorItem } from "./tutor-item";

interface TutorsProps {
    items: Tutor[];
}
export const Tutors = ({
items,
}: TutorsProps) => {
    return (
      <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
        {items.map((item) => (
          <TutorItem
            key={item.id}
            label={item.title}            
            value={item.id}
          />
        ))}
      </div>
    );
}