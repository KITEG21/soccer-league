import type { Season, CreateSeasonRequest, UpdateSeasonRequest } from "../types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class SeasonsApiService {
  async getSeasons(params: ListApiParams = { limit: 100 }): Promise<Season[]> {
    return apiRequest<Season[]>(API_ROUTES.seasons.collection(params));
  }

  async getSeason(id: number): Promise<Season> {
    return apiRequest<Season>(API_ROUTES.seasons.detail(id));
  }

  async createSeason(season: CreateSeasonRequest): Promise<Season> {
    return apiRequest<Season>(API_ROUTES.seasons.collection(), {
      method: "POST",
      body: JSON.stringify(season),
    });
  }

  async updateSeason(id: number, season: UpdateSeasonRequest): Promise<Season> {
    return apiRequest<Season>(API_ROUTES.seasons.detail(id), {
      method: "PUT",
      body: JSON.stringify(season),
    });
  }

  async deleteSeason(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.seasons.detail(id), {
      method: "DELETE",
    });
  }
}

export const seasonsApiService = new SeasonsApiService();
