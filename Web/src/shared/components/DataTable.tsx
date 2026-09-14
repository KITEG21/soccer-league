import type { ReactNode } from "react";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface DataTableProps {
  readonly columns: readonly string[];
  readonly isLoading?: boolean;
  readonly error?: unknown;
  readonly errorMessage?: string;
  readonly isEmpty?: boolean;
  readonly emptyMessage?: string;
  readonly emptyAction?: ReactNode;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

const SKELETON_ROWS = ["a", "b", "c", "d", "e"];

export const DataTable = ({
  columns,
  isLoading = false,
  error = null,
  errorMessage = "No se pudieron cargar los datos",
  isEmpty = false,
  emptyMessage = "No hay registros",
  emptyAction,
  footer,
  children,
}: DataTableProps) => {
  const renderBody = () => {
    if (isLoading) {
      return SKELETON_ROWS.map((row) => (
        <TableRow key={row}>
          {columns.map((column) => (
            <TableCell key={column}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-24 text-center text-destructive"
          >
            {errorMessage}
          </TableCell>
        </TableRow>
      );
    }

    if (isEmpty) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-32 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <span className="text-sm">{emptyMessage}</span>
              {emptyAction}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return children;
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{renderBody()}</TableBody>
          </Table>
        </div>
      </Card>
      {footer && <div className="px-1">{footer}</div>}
    </div>
  );
};
