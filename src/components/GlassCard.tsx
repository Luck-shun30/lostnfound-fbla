
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    intensity?: "normal" | "subtle";
}

export const GlassCard = ({
    children,
    className,
    intensity = "normal",
    ...props
}: GlassCardProps) => {
    return (
        <div
            className={cn(
                "rounded-2xl transition-all duration-300",
                intensity === "normal" ? "liquid-glass" : "liquid-glass-subtle",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
