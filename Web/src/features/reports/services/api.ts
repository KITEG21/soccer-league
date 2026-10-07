import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type {
  StandingRow,
  HeadToHeadMatch,
  MatchByDateRow,
  CoachExperience,
  StadiumAttendance,
  TeamStatusReport,
  AllStarPlayer
} from "../types";

class ReportsApiService {
  async getStandings(seasonId: number): Promise<StandingRow[]> {
    return apiRequest<StandingRow[]>(API_ROUTES.reports.standings(seasonId));
  }

  async getHeadToHead(team1: number, team2: number, seasonId?: number): Promise<HeadToHeadMatch[]> {
    return apiRequest<HeadToHeadMatch[]>(API_ROUTES.reports.matchesBetweenTeams(team1, team2, seasonId));
  }

  async getSchedule(date: string, stadiumId?: number): Promise<MatchByDateRow[]> {
    return apiRequest<MatchByDateRow[]>(API_ROUTES.reports.matchesByDate(date, stadiumId));
  }

  async getCoachExperience(): Promise<CoachExperience[]> {
    return apiRequest<CoachExperience[]>(API_ROUTES.reports.coachesByExperience());
  }

  async getStadiumAttendance(seasonId: number): Promise<StadiumAttendance[]> {
    return apiRequest<StadiumAttendance[]>(API_ROUTES.reports.stadiumsByAttendance(seasonId));
  }

  async getTeamStatus(teamId: number, seasonId: number): Promise<TeamStatusReport> {
    return apiRequest<TeamStatusReport>(API_ROUTES.reports.teamStatus(teamId, seasonId));
  }

  async getAllStarTeam(seasonId: number): Promise<AllStarPlayer[]> {
    return apiRequest<AllStarPlayer[]>(API_ROUTES.reports.allStarTeam(seasonId));
  }

  standingsPdfUrl(seasonId: number): string {
    return API_ROUTES.reports.pdf("standings", { seasonId });
  }

  headToHeadPdfUrl(team1: number, team2: number, seasonId?: number): string {
    return API_ROUTES.reports.pdf("matches-between-teams", { team1, team2, seasonId });
  }

  schedulePdfUrl(date: string, stadiumId?: number): string {
    return API_ROUTES.reports.pdf("matches-by-date", { date, stadiumId });
  }

  coachExperiencePdfUrl(): string {
    return API_ROUTES.reports.pdf("coaches-by-experience");
  }

  stadiumAttendancePdfUrl(seasonId: number): string {
    return API_ROUTES.reports.pdf("stadiums-by-attendance", { seasonId });
  }

  teamStatusPdfUrl(teamId: number, seasonId: number): string {
    return API_ROUTES.reports.pdf("team-status", { teamId, seasonId });
  }

  allStarPdfUrl(seasonId: number): string {
    return API_ROUTES.reports.pdf("all-star-team", { seasonId });
  }
}

export const reportsApiService = new ReportsApiService();
