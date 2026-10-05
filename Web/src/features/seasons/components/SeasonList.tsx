import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
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
import type { Season } from "../types";
import { useTranslations } from "next-intl";

export const getSeasonFilters = (t: (key: string) => string): readonly FilterDefinition[] => [
  { key: "start_date", label: t("Common.start"), type: "date-range" },
  { key: "end_date", label: t("Common.end"), type: "date-range" },
];

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return "—";
  }
};

const getSeasonTitle = (season: Season) => {
  if (!season.start_date || !season.end_date) return `Temporada ${season.id}`;
  try {
    const start = format(parseISO(season.start_date), "MMM/yy", { locale: es });
    const end = format(parseISO(season.end_date), "MMM/yy", { locale: es });
    return `${start} - ${end}`;
  } catch {
    return `Temporada ${season.id}`;
  }
};

const columnHelper = createColumnHelper<typeof dataTableFeatures, Season>();

interface SeasonListProps {
  readonly seasons: readonly Season[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (season: Season) => void;
  readonly onDelete?: (id: number) => void;
}

export function SeasonList({
  seasons,
  total,
  query,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: SeasonListProps) {
  const t = useTranslations("Lists");
  const common = useTranslations("Common");
  const columns = columnHelper.columns([
    columnHelper.accessor((season) => season.start_date ?? "", {
      id: "title",
      header: common("season"),
      cell: ({ row }) => (
        <AppLink href={APP_ROUTES.matches({ season_id: row.original.id })}>
          {getSeasonTitle(row.original)}
        </AppLink>
      ),
      meta: { cellClassName: "font-medium capitalize" },
    }),
    columnHelper.accessor("start_date", {
      header: common("start"),
      cell: ({ getValue }) => formatDate(getValue()),
      meta: { cellClassName: "tabular-nums text-muted-foreground" },
    }),
    columnHelper.accessor("end_date", {
      header: common("end"),
      cell: ({ getValue }) => formatDate(getValue()),
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
        title={t("seasonsTitle")}
        description={t("seasonsDescription")}
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              {t("newSeason")}
            </Button>
          )
        }
      />

      <DataTableToolbar query={query} searchable={false} />

      <ServerDataTable
        columns={columns}
        data={seasons}
        total={total}
        query={query}
        getRowId={(season) => String(season.id)}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage={t("seasonsLoadError")}
        emptyMessage={t("seasonsEmpty")}
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              {t("createFirstSeason")}
            </Button>
          )
        }
      />
    </>
  );
}
