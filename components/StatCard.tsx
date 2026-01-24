import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  accent?: "default" | "success" | "danger";
};

const accentStyles = {
  default: "text-foreground",
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
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-2 font-display text-2xl font-semibold",
            accentStyles[accent]
          )}
        >
          {value}
        </p>
        {helper && (
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        )}
      </CardContent>
    </Card>
  );
}
