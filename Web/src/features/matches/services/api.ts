import type { Match, CreateMatchRequest, UpdateMatchRequest } from "../types";
import { apiRequest } from "@/shared/utils/api-client";

class MatchesApiService {
  async getMatches(): Promise<Match[]> {
    return apiRequest<Match[]>("/matches?limit=100");
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
