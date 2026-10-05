import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { RowActions } from "@/shared/components/RowActions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  type dataTableFeatures,
  type ListQueryState,
} from "@/shared/components/data-table";
import type { Match } from "../types";

const columnHelper = createColumnHelper<typeof dataTableFeatures, Match>();

interface MatchListProps {
  readonly matches: readonly Match[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (match: Match) => void;
  readonly onDelete?: (id: number) => void;
}

export function MatchList({
  matches,
  total,
  query,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: MatchListProps) {
  const t = useTranslations("Matches");
  const root = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const columns = columnHelper.columns([
    columnHelper.accessor("match_date", {
      header: t("date"),
      cell: ({ row }) => (
        <Link href={`/matches/${row.original.id}`} className="after:absolute after:inset-0">
          {format(new Date(row.original.match_date), "dd/MM/yyyy HH:mm", { locale: dateLocale })}
        </Link>
      ),
      meta: { cellClassName: "whitespace-nowrap tabular-nums text-muted-foreground" },
    }),
    columnHelper.accessor("home_team_name", {
      header: t("home"),
      cell: ({ row }) => (
        <AppLink href={`/teams/${row.original.home_team_id}`}>
          {row.original.home_team_name || root("Dashboard.teamFallback", { id: row.original.home_team_id })}
        </AppLink>
      ),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor((match) => match.home_goals - match.away_goals, {
      id: "result",
      header: t("result"),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono tabular-nums">
          {row.original.home_goals} - {row.original.away_goals}
        </Badge>
      ),
    }),
    columnHelper.accessor("away_team_name", {
      header: t("away"),
      cell: ({ row }) => (
        <AppLink href={`/teams/${row.original.away_team_id}`}>
          {row.original.away_team_name || root("Dashboard.teamFallback", { id: row.original.away_team_id })}
        </AppLink>
      ),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("stadium_name", {
      header: t("stadium"),
      cell: ({ row }) => row.original.stadium_name || root("Dashboard.stadiumFallback", { id: row.original.stadium_id }),
      meta: { cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor("attendance", {
      header: t("attendance"),
      cell: ({ getValue }) => (getValue() ?? 0).toLocaleString(locale),
      meta: { cellClassName: "tabular-nums text-muted-foreground" },
    }),
    columnHelper.accessor("disputed", {
      header: t("status"),
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "outline"}>
          {getValue() ? t("completed") : t("pending")}
        </Badge>
      ),
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
      meta: { cellClassName: "relative text-right" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              {t("new")}
            </Button>
          )
        }
      />

      <DataTableToolbar query={query} searchPlaceholder={t("search")} />

      <ServerDataTable
        columns={columns}
        data={matches}
        total={total}
        query={query}
        getRowId={(match) => String(match.id)}
        getRowClassName={() => "relative cursor-pointer hover:bg-accent"}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage={t("loadError")}
        emptyMessage={t("empty")}
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              {t("createFirst")}
            </Button>
          )
        }
      />
    </>
  );
}
