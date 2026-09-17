import type { Match, CreateMatchRequest, UpdateMatchRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class MatchesApiService {
  async getMatches(): Promise<Match[]> {
    const res = await apiRequest<PaginatedResponse<Match>>(API_ROUTES.matches.collection({ limit: 100 }));
    return res.data;
  }

  async getMatchesPage(params: ListApiParams): Promise<PaginatedResponse<Match>> {
    return apiRequest<PaginatedResponse<Match>>(API_ROUTES.matches.collection(params));
  }

  async getMatch(id: number): Promise<Match> {
    return apiRequest<Match>(API_ROUTES.matches.detail(id));
  }

  async createMatch(match: CreateMatchRequest): Promise<Match> {
    return apiRequest<Match>(API_ROUTES.matches.collection(), {
      method: "POST",
      body: JSON.stringify(match),
    });
  }

  async updateMatch(id: number, match: UpdateMatchRequest): Promise<Match> {
    return apiRequest<Match>(API_ROUTES.matches.detail(id), {
      method: "PUT",
      body: JSON.stringify(match),
    });
  }

  async deleteMatch(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.matches.detail(id), {
      method: "DELETE",
    });
  }
}

export const matchesApiService = new MatchesApiService();
