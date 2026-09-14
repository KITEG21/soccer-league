import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

interface FieldProps {
  readonly label: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export const Field = ({ label, className, children }: FieldProps) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
};
