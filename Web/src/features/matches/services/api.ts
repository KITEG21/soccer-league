import type { Match, CreateMatchRequest, UpdateMatchRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";

class MatchesApiService {
  async getMatches(): Promise<Match[]> {
    const res = await apiRequest<PaginatedResponse<Match>>("/matches?limit=100");
    return res.data;
  }

  async getMatchesPage(page: number, pageSize: number): Promise<PaginatedResponse<Match>> {
    const offset = (page - 1) * pageSize;
    return apiRequest<PaginatedResponse<Match>>(`/matches?limit=${pageSize}&offset=${offset}`);
  }

  async getMatch(id: number): Promise<Match> {
    return apiRequest<Match>(`/matches/${id}`);
  }

  async createMatch(match: CreateMatchRequest): Promise<Match> {
    return apiRequest<Match>("/matches", {
      method: "POST",
      body: JSON.stringify(match),
    });
  }

  async updateMatch(id: number, match: UpdateMatchRequest): Promise<Match> {
    return apiRequest<Match>(`/matches/${id}`, {
      method: "PUT",
      body: JSON.stringify(match),
    });
  }

  async deleteMatch(id: number): Promise<void> {
    return apiRequest<void>(`/matches/${id}`, {
      method: "DELETE",
    });
  }
}

export const matchesApiService = new MatchesApiService();
