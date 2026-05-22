import type { Team, CreateTeamRequest, UpdateTeamRequest } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://soccer-league-1.onrender.com";

class TeamsApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses (like DELETE requests)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return undefined as T;
    }

    return response.json();
  }

  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>("/teams");
  }

  async getTeam(id: number): Promise<Team> {
    return this.request<Team>(`/teams/${id}`);
  }

  async createTeam(team: CreateTeamRequest): Promise<Team> {
    return this.request<Team>("/teams", {
      method: "POST",
      body: JSON.stringify(team),
    });
  }

  async updateTeam(id: number, team: UpdateTeamRequest): Promise<Team> {
    return this.request<Team>(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(team),
    });
  }

  async deleteTeam(id: number): Promise<void> {
    return this.request<void>(`/teams/${id}`, {
      method: "DELETE",
    });
  }
}

export const teamsApiService = new TeamsApiService();
