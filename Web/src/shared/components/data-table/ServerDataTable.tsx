import { useEffect, type ReactNode } from "react";
import {
  rowSortingFeature,
  tableFeatures,
  useTable,
  type CellData,
  type ColumnDef,
  type Header,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Pagination } from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/utils/utils";
import { PAGE_SIZE_OPTIONS, type ListQueryState } from "./list-query";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnMeta: {} as {
    readonly headerClassName?: string;
    readonly cellClassName?: string;
  },
});

type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, CellData>;

const SKELETON_ROWS = ["a", "b", "c", "d", "e"];

interface SortableHeaderProps<TData extends RowData> {
  readonly header: Header<DataTableFeatures, TData, unknown>;
  readonly children: ReactNode;
}

const SortableHeader = <TData extends RowData>({ header, children }: SortableHeaderProps<TData>) => {
  const direction = header.column.getIsSorted();
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      className={cn(
        "-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground",
        direction && "text-foreground",
      )}
    >
      {children}
      <Icon className={cn("size-3.5", !direction && "opacity-40")} />
    </button>
  );
};

interface ServerDataTableProps<TData extends RowData> {
  readonly columns: DataTableColumn<TData>[];
  readonly data: readonly TData[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly getRowId: (row: TData) => string;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly error?: unknown;
  readonly errorMessage?: string;
  readonly emptyMessage?: string;
  readonly emptyAction?: ReactNode;
  readonly getRowClassName?: (row: TData) => string | undefined;
}

export const ServerDataTable = <TData extends RowData>({
  columns,
  data,
  total,
  query,
  getRowId,
  isLoading = false,
  isFetching = false,
  error = null,
  errorMessage = "No se pudieron cargar los datos",
  emptyMessage = "No hay registros",
  emptyAction,
  getRowClassName,
}: ServerDataTableProps<TData>) => {
  const sorting: SortingState = query.sort
    ? [{ id: query.sort, desc: query.order === "desc" }]
    : [];

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: data as TData[],
    getRowId,
    manualSorting: true,
    enableSortingRemoval: true,
    sortDescFirst: true,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const [first] = next;
      query.setSorting(first?.id ?? null, first ? (first.desc ? "desc" : "asc") : null);
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const { page, setPage } = query;
  useEffect(() => {
    if (!isLoading && !isFetching && page > totalPages) setPage(totalPages);
  }, [isLoading, isFetching, page, totalPages, setPage]);

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const columnCount = columns.length;

  const renderBody = () => {
    if (isLoading) {
      return SKELETON_ROWS.map((key) => (
        <TableRow key={key}>
          {Array.from({ length: columnCount }, (_, index) => (
            <TableCell key={index}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columnCount} className="h-24 text-center text-destructive">
            {errorMessage}
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      const filtered = query.activeFilters.length > 0 || query.search.trim() !== "";
      return (
        <TableRow>
          <TableCell colSpan={columnCount} className="h-32 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <span className="text-sm">
                {filtered ? "No hay resultados con los filtros aplicados" : emptyMessage}
              </span>
              {filtered ? (
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={query.clearFilters}
                >
                  Limpiar filtros
                </button>
              ) : (
                emptyAction
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row) => (
      <TableRow key={row.id} className={getRowClassName?.(row.original)}>
        {row.getAllCells().map((cell) => (
          <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
            <table.FlexRender cell={cell} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div
          className={cn(
            "overflow-x-auto transition-opacity",
            isFetching && !isLoading && "opacity-60",
          )}
          aria-busy={isFetching}
        >
          <Table>
            <TableHeader>
              {headerGroups.map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    const direction = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "whitespace-nowrap",
                          header.column.columnDef.meta?.headerClassName,
                        )}
                        aria-sort={
                          direction === "asc"
                            ? "ascending"
                            : direction === "desc"
                              ? "descending"
                              : undefined
                        }
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <SortableHeader header={header}>
                            <table.FlexRender header={header} />
                          </SortableHeader>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{renderBody()}</TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Filas por página</span>
          <Select
            value={String(query.pageSize)}
            onValueChange={(value) => query.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-20" aria-label="Filas por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Pagination
            page={query.page}
            total={total}
            pageSize={query.pageSize}
            onPageChange={query.setPage}
          />
        </div>
      </div>
    </div>
  );
};
