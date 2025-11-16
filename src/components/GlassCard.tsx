import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard = ({ children, className, hover = false, style }: GlassCardProps) => {
  return (
    <div
      style={style}
      className={cn(
        "backdrop-blur-md bg-glass/80 border border-glass-border rounded-lg shadow-glass",
        "transition-all duration-300",
        hover && "hover:shadow-glass-hover hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
};
