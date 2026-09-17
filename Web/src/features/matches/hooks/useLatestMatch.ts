import { useQuery } from "@tanstack/react-query";
import { matchesApiService } from "../services/api";
import type { Match } from "../types";

interface LatestMatchResult {
  readonly match: Match | undefined;
  readonly isPending: boolean;
}

export const useLatestMatch = (): LatestMatchResult => {
  const { data: matches = [], isPending } = useQuery({
    queryKey: ["matches", "all"],
    queryFn: () => matchesApiService.getMatches(),
  });

  const match = [...matches].sort(
    (a, b) =>
      new Date(b.match_date).getTime() - new Date(a.match_date).getTime(),
  )[0];

  return { match, isPending };
};
