import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PaginationProps {
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const controls = [
    {
      label: "Primera página",
      icon: ChevronsLeft,
      target: 1,
      disabled: page <= 1,
    },
    {
      label: "Página anterior",
      icon: ChevronLeft,
      target: page - 1,
      disabled: page <= 1,
    },
    {
      label: "Página siguiente",
      icon: ChevronRight,
      target: page + 1,
      disabled: page >= totalPages,
    },
    {
      label: "Última página",
      icon: ChevronsRight,
      target: totalPages,
      disabled: page >= totalPages,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
      <p>
        Mostrando <span className="text-foreground tabular-nums">{from}</span>–
        <span className="text-foreground tabular-nums">{to}</span> de{" "}
        <span className="text-foreground tabular-nums">{total}</span>
      </p>

      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          {controls.map((control) => (
            <Button
              key={control.label}
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={control.label}
              title={control.label}
              disabled={control.disabled}
              onClick={() => onPageChange(control.target)}
            >
              <control.icon className="size-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
