import type { Team, CreateTeamRequest, UpdateTeamRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class TeamsApiService {
  async getTeams(): Promise<Team[]> {
    const res = await apiRequest<PaginatedResponse<Team>>(API_ROUTES.teams.collection({ limit: 100 }));
    return res.data;
  }

  async getTeamsPage(params: ListApiParams): Promise<PaginatedResponse<Team>> {
    return apiRequest<PaginatedResponse<Team>>(API_ROUTES.teams.collection(params));
  }

  async getTeam(id: number): Promise<Team> {
    return apiRequest<Team>(API_ROUTES.teams.detail(id));
  }

  async createTeam(team: CreateTeamRequest): Promise<Team> {
    return apiRequest<Team>(API_ROUTES.teams.collection(), {
      method: "POST",
      body: JSON.stringify(team),
    });
  }

  async updateTeam(id: number, team: UpdateTeamRequest): Promise<Team> {
    return apiRequest<Team>(API_ROUTES.teams.detail(id), {
      method: "PUT",
      body: JSON.stringify(team),
    });
  }

  async deleteTeam(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.teams.detail(id), {
      method: "DELETE",
    });
  }
}

export const teamsApiService = new TeamsApiService();
