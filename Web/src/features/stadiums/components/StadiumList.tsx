import { Plus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  type dataTableFeatures,
  type FilterDefinition,
  type ListQueryState,
} from "@/shared/components/data-table";
import type { Stadium } from "../types";
import { useLocale, useTranslations } from "next-intl";

export const getStadiumFilters = (t: (key: string) => string): readonly FilterDefinition[] => [
  { key: "capacity", label: t("Common.capacity"), type: "number-range" },
];

const columnHelper = createColumnHelper<typeof dataTableFeatures, Stadium>();

interface StadiumListProps {
  readonly stadiums: readonly Stadium[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (stadium: Stadium) => void;
  readonly onDelete?: (id: number) => void;
}

export function StadiumList({
  stadiums,
  total,
  query,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: StadiumListProps) {
  const t = useTranslations("Lists");
  const common = useTranslations("Common");
  const locale = useLocale();
  const columns = columnHelper.columns([
    columnHelper.accessor("name", {
      header: common("stadium"),
      cell: ({ row }) => (
        <AppLink href={APP_ROUTES.matches({ stadium_id: row.original.id })}>
          {row.original.name}
        </AppLink>
      ),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("capacity", {
      header: common("capacity"),
      cell: ({ getValue }) => getValue()?.toLocaleString(locale) ?? 0,
      meta: { cellClassName: "tabular-nums text-muted-foreground" },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActions
          onEdit={onEdit ? () => onEdit(row.original) : undefined}
          onDelete={onDelete ? () => onDelete(row.original.id) : undefined}
        />
      ),
      meta: { cellClassName: "text-right" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={t("stadiumsTitle")}
        description={t("stadiumsDescription")}
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              {t("newStadium")}
            </Button>
          )
        }
      />

      <DataTableToolbar query={query} searchPlaceholder={t("searchStadiums")} />

      <ServerDataTable
        columns={columns}
        data={stadiums}
        total={total}
        query={query}
        getRowId={(stadium) => String(stadium.id)}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage={t("stadiumsLoadError")}
        emptyMessage={t("stadiumsEmpty")}
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              {t("createFirstStadium")}
            </Button>
          )
        }
      />
    </>
  );
}
