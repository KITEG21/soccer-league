type Id = number | string;
type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

export const withQuery = (path: string, query?: Query) => {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};

const resource = (base: string) => ({
  collection: (query?: Query) => withQuery(base, query),
  detail: (id: Id) => `${base}/${id}`,
});

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  users: resource("/users"),
  teams: resource("/teams"),
  stadiums: resource("/stadiums"),
  seasons: resource("/seasons"),
  players: resource("/players"),
  coaches: resource("/coaches"),
  matches: resource("/matches"),
  playerStats: resource("/player-stats"),
  reports: {
    standings: (seasonId: Id) =>
      withQuery("/reports/standings", { seasonId }),
    matchesBetweenTeams: (team1: Id, team2: Id, seasonId?: Id) =>
      withQuery("/reports/matches-between-teams", { team1, team2, seasonId }),
    matchesByDate: (date: string, stadiumId?: Id) =>
      withQuery("/reports/matches-by-date", { date, stadiumId }),
    coachesByExperience: () => "/reports/coaches-by-experience",
    stadiumsByAttendance: (seasonId: Id) =>
      withQuery("/reports/stadiums-by-attendance", { seasonId }),
    teamStatus: (teamId: Id, seasonId: Id) =>
      withQuery(`/reports/team-status/${teamId}`, { seasonId }),
    allStarTeam: (seasonId: Id) =>
      withQuery("/reports/all-star-team", { seasonId }),
  },
} as const;

export const WEB_API_ROUTES = {
  logout: "/api/auth/logout",
  backend: "/api/backend",
} as const;
