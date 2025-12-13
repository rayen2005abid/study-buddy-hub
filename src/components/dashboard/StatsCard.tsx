import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "accent" | "success";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  const variantStyles = {
    default: "border-border",
    primary: "border-primary/20 bg-primary/5",
    accent: "border-accent/20 bg-accent/5",
    success: "border-success/20 bg-success/5",
  };

  const iconStyles = {
    default: "bg-secondary text-foreground",
    primary: "gradient-primary text-primary-foreground",
    accent: "gradient-accent text-accent-foreground",
    success: "gradient-success text-success-foreground",
  };

  return (
    <Card
      className={cn(
        "glass-hover animate-fade-in",
        variantStyles[variant]
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend.positive ? "text-success" : "text-destructive"
                )}
              >
                <span>{trend.positive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}% from last week</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconStyles[variant]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
