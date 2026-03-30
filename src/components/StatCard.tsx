import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  gradient?: "blue" | "green" | "amber" | "purple";
  className?: string;
}

const gradientMap = {
  blue: "gradient-card-blue",
  green: "gradient-card-green",
  amber: "gradient-card-amber",
  purple: "gradient-card-purple",
};

const iconBgMap = {
  blue: "bg-primary/15 text-primary",
  green: "bg-success/15 text-success",
  amber: "bg-warning/15 text-warning",
  purple: "bg-[hsl(var(--primary-glow))]/15 text-[hsl(var(--primary-glow))]",
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, gradient = "blue", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card p-4 sm:p-5 hover-lift overflow-hidden",
        gradientMap[gradient],
        className
      )}
    >
      {/* Subtle glow orb */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-[11px] sm:text-xs font-semibold flex items-center gap-0.5",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              <span className="text-sm">{trend.positive ? "↑" : "↓"}</span> {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
          iconBgMap[gradient]
        )}>
          <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
        </div>
      </div>
    </div>
  );
}
