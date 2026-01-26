// components/instaskul-logo-circle.tsx
"use client";

import { GraduationCap } from "lucide-react";

interface InstaSkulLogoCircleProps {
  size?: number;
}

export const InstaSkulLogoCircle: React.FC<InstaSkulLogoCircleProps> = ({
  size = 500,
}) => {
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: "#f97316", // Orange background
        borderRadius: "50%",
      }}
    >
      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <GraduationCap 
          style={{
            width: size * 0.4,
            height: size * 0.4,
            color: "white",
            strokeWidth: 2
          }}
        />
      </div>
      
      {/* Text in circular path (optional) */}
      <div 
        className="absolute bottom-[20%] font-bold text-white text-center"
        style={{
          fontSize: size * 0.08,
          letterSpacing: '0.05em'
        }}
      >
        IS
      </div>
    </div>
  );
};