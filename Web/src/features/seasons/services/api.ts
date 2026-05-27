import type { Season, CreateSeasonRequest, UpdateSeasonRequest } from "../types";
import { apiRequest } from "@/shared/utils/api-client";

class SeasonsApiService {
  async getSeasons(): Promise<Season[]> {
    return apiRequest<Season[]>("/seasons");
  }

  async getSeason(id: number): Promise<Season> {
    return apiRequest<Season>(`/seasons/${id}`);
  }

  async createSeason(season: CreateSeasonRequest): Promise<Season> {
    return apiRequest<Season>("/seasons", {
      method: "POST",
      body: JSON.stringify(season),
    });
  }

  async updateSeason(id: number, season: UpdateSeasonRequest): Promise<Season> {
    return apiRequest<Season>(`/seasons/${id}`, {
      method: "PUT",
      body: JSON.stringify(season),
    });
  }

  async deleteSeason(id: number): Promise<void> {
    return apiRequest<void>(`/seasons/${id}`, {
      method: "DELETE",
    });
  }
}

export const seasonsApiService = new SeasonsApiService();
