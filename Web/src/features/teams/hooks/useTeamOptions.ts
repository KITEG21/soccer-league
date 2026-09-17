import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FilterOption } from "@/shared/components/data-table/list-query";
import { teamsApiService } from "../services/api";

export const useTeamOptions = () => {
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });

  const options = useMemo<FilterOption[]>(
    () => teams.map((team) => ({ value: String(team.id), label: team.name })),
    [teams],
  );

  return { teams, options, isLoading };
};
