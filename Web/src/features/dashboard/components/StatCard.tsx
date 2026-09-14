import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
  readonly icon: LucideIcon;
  readonly isLoading?: boolean;
}

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  isLoading = false,
}: StatCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="truncate text-3xl font-semibold tabular-nums">
              {value}
            </p>
          )}
          {hint && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
};
