import { apiRequest } from "@/shared/utils/api-client";
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
    return apiRequest<StandingRow[]>(`/reports/standings?seasonId=${seasonId}`);
  }

  async getHeadToHead(team1: number, team2: number, seasonId?: number): Promise<HeadToHeadMatch[]> {
    const seasonParam = seasonId ? `&seasonId=${seasonId}` : "";
    return apiRequest<HeadToHeadMatch[]>(`/reports/matches-between-teams?team1=${team1}&team2=${team2}${seasonParam}`);
  }

  async getSchedule(date: string, stadiumId?: number): Promise<MatchByDateRow[]> {
    const stadiumParam = stadiumId ? `&stadiumId=${stadiumId}` : "";
    return apiRequest<MatchByDateRow[]>(`/reports/matches-by-date?date=${date}${stadiumParam}`);
  }

  async getCoachExperience(): Promise<CoachExperience[]> {
    return apiRequest<CoachExperience[]>("/reports/coaches-by-experience");
  }

  async getStadiumAttendance(seasonId: number): Promise<StadiumAttendance[]> {
    return apiRequest<StadiumAttendance[]>(`/reports/stadiums-by-attendance?seasonId=${seasonId}`);
  }

  async getTeamStatus(teamId: number, seasonId: number): Promise<TeamStatusReport> {
    return apiRequest<TeamStatusReport>(`/reports/team-status/${teamId}?seasonId=${seasonId}`);
  }

  async getAllStarTeam(seasonId: number): Promise<AllStarPlayer[]> {
    return apiRequest<AllStarPlayer[]>(`/reports/all-star-team?seasonId=${seasonId}`);
  }
}

export const reportsApiService = new ReportsApiService();
