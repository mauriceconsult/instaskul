// components/instaskul-logo-monogram.tsx
"use client";

interface InstaSkulLogoMonogramProps {
  size?: number;
  variant?: "orange" | "gradient" | "minimal";
}

export const InstaSkulLogoMonogram: React.FC<InstaSkulLogoMonogramProps> = ({
  size = 500,
  variant = "orange",
}) => {
  const variants = {
    orange: {
      background: "#f97316",
      text: "white",
      gradient: ""
    },
    gradient: {
      background: "",
      text: "white",
      gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
    },
    minimal: {
      background: "#0f172a",
      text: "white",
      gradient: ""
    }
  };

  const style = variants[variant];

  return (
    <div 
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: style.gradient || style.background,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
      }}
    >
      <div 
        className="font-black text-center"
        style={{
          fontSize: size * 0.35,
          color: style.text,
          letterSpacing: '-0.05em',
          lineHeight: 1
        }}
      >
        iS
      </div>
    </div>
  );
};