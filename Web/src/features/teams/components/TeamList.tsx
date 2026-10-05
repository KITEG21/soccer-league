import Link from "next/link";
import { Plus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/shared/components/PageHeader";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  type dataTableFeatures,
  type FilterDefinition,
  type ListQueryState,
} from "@/shared/components/data-table";
import type { Team } from "../types";
import { useTranslations } from "next-intl";

export const getTeamFilters = (t: (key: string) => string): readonly FilterDefinition[] => [
  { key: "province", label: t("Common.province"), type: "text" },
  {
    key: "championships_won",
    label: t("Team.championshipsWon"),
    type: "number-range",
    advanced: true,
  },
  {
    key: "championships_played",
    label: t("Team.championshipsPlayed"),
    type: "number-range",
    advanced: true,
  },
];

const columnHelper = createColumnHelper<typeof dataTableFeatures, Team>();

interface TeamListProps {
  readonly teams: readonly Team[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (team: Team) => void;
  readonly onDelete?: (id: number) => void;
}

export function TeamList({
  teams,
  total,
  query,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: TeamListProps) {
  const t = useTranslations("Lists");
  const common = useTranslations("Common");
  const team = useTranslations("Team");
  const columns = columnHelper.columns([
    columnHelper.accessor("name", {
      header: common("team"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span
            className="size-3 shrink-0 rounded-full border"
            style={{ backgroundColor: row.original.color || "transparent" }}
          />
          <Link
            href={`/teams/${row.original.id}`}
            className="font-medium after:absolute after:inset-0"
          >
            {row.original.name}
          </Link>
        </div>
      ),
    }),
    columnHelper.accessor("province", {
      header: common("province"),
      cell: ({ getValue }) => getValue() || "—",
      meta: { cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor("mascot", {
      header: common("mascot"),
      cell: ({ getValue }) => getValue() || "—",
      meta: { cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor("championships_won", {
      header: team("championshipsWon"),
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("players_count", {
      header: common("player"),
      cell: ({ row }) => row.original.players_count ?? row.original.players?.length ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("coaches_count", {
      header: common("coach"),
      cell: ({ row }) => row.original.coaches_count ?? row.original.coaches?.length ?? 0,
      meta: { cellClassName: "tabular-nums" },
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
        title={t("teamsTitle")}
        description={t("teamsDescription")}
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              {t("newTeam")}
            </Button>
          )
        }
      />

      <DataTableToolbar
        query={query}
        searchPlaceholder={t("searchTeams")}
      />

      <ServerDataTable
        columns={columns}
        data={teams}
        total={total}
        query={query}
        getRowId={(team) => String(team.id)}
        getRowClassName={() => "relative cursor-pointer hover:bg-accent"}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage={t("teamsLoadError")}
        emptyMessage={t("teamsEmpty")}
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              {t("createFirstTeam")}
            </Button>
          )
        }
      />
    </>
  );
}
