import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  subtle?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, subtle = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          subtle ? "nb-card-subtle" : "nb-card",
          "rounded-lg",
          hover && "transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg",
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";
