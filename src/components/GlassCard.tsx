import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  subtle?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard = ({ children, className, hover = false, subtle = false, style }: GlassCardProps) => {
  return (
    <div
      style={style}
      className={cn(
        subtle ? "liquid-glass-subtle" : "liquid-glass",
        "rounded-lg transition-all duration-300",
        hover && "hover:shadow-glow hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
};
