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
        // Use neobrutal card styles site-wide (nb-card / nb-card-subtle)
        subtle ? "nb-card-subtle" : "nb-card",
        // maintain optional transition/hover classes passed by callers
        "transition-all duration-150",
        hover && "hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
};
