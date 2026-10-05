"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  useListQuery,
  type dataTableFeatures,
  type FilterDefinition,
} from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";
import { TeamPickerDialog } from "@/features/teams/components/TeamPickerDialog";
import { useTeamOptions } from "@/features/teams/hooks/useTeamOptions";
import { coachesApiService } from "../services/api";
import type { Coach } from "../types";
import { useTranslations } from "next-intl";

const columnHelper = createColumnHelper<typeof dataTableFeatures, Coach>();

export const CoachGlobalList = () => {
  const t = useTranslations("Lists");
  const common = useTranslations("Common");
  const team = useTranslations("Team");
  const canEdit = usePermission("coaches:write");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const router = useRouter();
  const { options: teamOptions } = useTeamOptions();

  const filters = useMemo<readonly FilterDefinition[]>(
    () => [
      { key: "team_id", label: common("team"), type: "select", options: teamOptions },
      { key: "experience_years", label: t("years"), type: "number-range", advanced: true },
      { key: "championships_won", label: team("championshipsWon"), type: "number-range", advanced: true },
      { key: "years_in_team", label: common("yearsInTeam"), type: "number-range", advanced: true },
    ],
    [teamOptions, common, t, team],
  );
  const query = useListQuery({ filters });

  const {
    data: coachesPage,
    isLoading: isLoadingCoaches,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["coaches", "list", query.apiParams],
    queryFn: () => coachesApiService.getCoachesPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const columns = columnHelper.columns([
    columnHelper.accessor("name", {
      header: common("name"),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("team_name", {
      header: common("team"),
      cell: ({ row }) =>
        row.original.team_id ? (
          <AppLink href={`/teams/${row.original.team_id}`}>
            {row.original.team_name ?? t("teamFallback", { id: row.original.team_id })}
          </AppLink>
        ) : (
          <span className="text-muted-foreground">{t("noTeam")}</span>
        ),
    }),
    columnHelper.accessor("experience_years", {
      header: t("years"),
      cell: ({ getValue }) => `${getValue() ?? 0} ${t("years")}`,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("championships_won", {
      header: team("championshipsWon"),
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("years_in_team", {
      header: common("yearsInTeam"),
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("coachesTitle")}
        description={t("coachesDescription")}
        actions={
          canEdit && (
            <Button onClick={() => setIsPickerOpen(true)}>
              <Plus />
              {t("newCoach")}
            </Button>
          )
        }
      />

      <TeamPickerDialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(teamId) => router.push(`/teams/${teamId}?create=coach`)}
        title={t("chooseTeam")}
        description={t("coachTeamDescription")}
      />

      <DataTableToolbar query={query} searchPlaceholder={t("searchCoaches")} />

      <ServerDataTable
        columns={columns}
        data={coachesPage?.data ?? []}
        total={coachesPage?.total ?? 0}
        query={query}
        getRowId={(coach) => String(coach.id)}
        isLoading={isLoadingCoaches}
        isFetching={isFetching}
        error={error}
        errorMessage={t("coachesLoadError")}
        emptyMessage={t("coachesEmpty")}
      />
    </div>
  );
};
