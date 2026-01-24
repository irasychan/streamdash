import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  accent?: "default" | "success" | "danger";
};

const accentStyles = {
  default: "text-primary",
  success: "text-emerald-400",
  danger: "text-red-400",
};

export default function StatCard({
  label,
  value,
  helper,
  accent = "default",
}: StatCardProps) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-secondary/95 to-card/95">
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "stat-value mt-2 mb-1 font-display text-4xl",
            accentStyles[accent]
          )}
        >
          {value}
        </p>
        {helper && (
          <p className="text-sm text-muted-foreground">{helper}</p>
        )}
      </CardContent>
    </Card>
  );
}
