import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  gradient?: "blue" | "green" | "amber" | "purple";
  iconColor?: string; /* e.g. "apple-icon-blue" */
  className?: string;
}

// Maps to Apple system icon gradients
const iconGradientMap: Record<string, string> = {
  blue:   "apple-icon-blue",
  green:  "apple-icon-green",
  amber:  "apple-icon-orange",
  purple: "apple-icon-purple",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = "blue",
  iconColor,
  className,
}: StatCardProps) {
  const iconClass = iconColor ?? iconGradientMap[gradient];

  return (
    <div
      className={cn(
        "apple-widget-hover group relative overflow-hidden p-4 sm:p-5",
        className
      )}
    >
      {/* Subtle top-right glow tint */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{
          background:
            gradient === "blue"   ? "rgba(0,122,255,0.12)"   :
            gradient === "green"  ? "rgba(52,199,89,0.12)"   :
            gradient === "amber"  ? "rgba(255,149,0,0.12)"   :
                                    "rgba(175,82,222,0.12)",
        }}
      />

      {/* Icon row */}
      <div className="flex items-start justify-between mb-3">
        {/* Squircle icon */}
        <div
          className={cn(
            "h-11 w-11 sm:h-12 sm:w-12 squircle-md flex items-center justify-center shrink-0 shadow-sm",
            "transition-transform duration-300 group-hover:scale-105",
            iconClass
          )}
        >
          <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-white" strokeWidth={2} />
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
              trend.positive
                ? "text-[#34C759] bg-[#34C759]/10"
                : "text-[#FF3B30] bg-[#FF3B30]/10"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {/* Value */}
      <p
        className="text-[32px] sm:text-[34px] font-bold leading-none tracking-tight text-foreground"
        style={{ fontFamily: '-apple-system, "SF Pro Display", "Space Grotesk", sans-serif', letterSpacing: "-0.5px" }}
      >
        {value}
      </p>

      {/* Title */}
      <p className="mt-1 text-ios-subhead font-semibold text-foreground/80">{title}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-0.5 text-ios-caption1 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
