import type { Team, CreateTeamRequest, UpdateTeamRequest } from "../types";
import { apiRequest } from "@/shared/utils/api-client";

class TeamsApiService {
  async getTeams(): Promise<Team[]> {
    return apiRequest<Team[]>("/teams?limit=100");
  }

  async getTeam(id: number): Promise<Team> {
    return apiRequest<Team>(`/teams/${id}`);
  }

  async createTeam(team: CreateTeamRequest): Promise<Team> {
    return apiRequest<Team>("/teams", {
      method: "POST",
      body: JSON.stringify(team),
    });
  }

  async updateTeam(id: number, team: UpdateTeamRequest): Promise<Team> {
    return apiRequest<Team>(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(team),
    });
  }

  async deleteTeam(id: number): Promise<void> {
    return apiRequest<void>(`/teams/${id}`, {
      method: "DELETE",
    });
  }
}

export const teamsApiService = new TeamsApiService();
