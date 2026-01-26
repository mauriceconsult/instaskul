// components/instaskul-logo-square.tsx
"use client";

import { GraduationCap } from "lucide-react";

interface InstaSkulLogoSquareProps {
  size?: number; // Width and height in pixels
  showTagline?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export const InstaSkulLogoSquare: React.FC<InstaSkulLogoSquareProps> = ({
  size = 500,
  showTagline = false,
  backgroundColor = "#f8fafc", // Light gray background
  textColor = "#0f172a", // Dark text
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor,
        padding: size * 0.15, // 15% padding
      }}
    >
      {/* Icon */}
      <GraduationCap 
        style={{
          width: size * 0.3,
          height: size * 0.3,
          color: "#f97316", // Orange
          strokeWidth: 2
        }}
      />
      
      {/* Brand name */}
      <div 
        className="font-bold text-center mt-4"
        style={{
          fontSize: size * 0.12,
          color: textColor,
          letterSpacing: '-0.02em'
        }}
      >
        instaSkul
      </div>
      
      {/* Optional tagline */}
      {showTagline && (
        <div 
          className="font-medium text-center"
          style={{
            fontSize: size * 0.05,
            color: "#64748b",
            marginTop: size * 0.02
          }}
        >
          Knowledge Management
        </div>
      )}
    </div>
  );
};