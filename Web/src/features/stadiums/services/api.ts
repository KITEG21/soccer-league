import type { Stadium, CreateStadiumRequest, UpdateStadiumRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class StadiumsApiService {
  async getStadiums(): Promise<Stadium[]> {
    const res = await apiRequest<PaginatedResponse<Stadium>>(API_ROUTES.stadiums.collection({ limit: 100 }));
    return res.data;
  }

  async getStadiumsPage(params: ListApiParams): Promise<PaginatedResponse<Stadium>> {
    return apiRequest<PaginatedResponse<Stadium>>(API_ROUTES.stadiums.collection(params));
  }

  async getStadium(id: number): Promise<Stadium> {
    return apiRequest<Stadium>(API_ROUTES.stadiums.detail(id));
  }

  async createStadium(stadium: CreateStadiumRequest): Promise<Stadium> {
    return apiRequest<Stadium>(API_ROUTES.stadiums.collection(), {
      method: "POST",
      body: JSON.stringify(stadium),
    });
  }

  async updateStadium(id: number, stadium: UpdateStadiumRequest): Promise<Stadium> {
    return apiRequest<Stadium>(API_ROUTES.stadiums.detail(id), {
      method: "PUT",
      body: JSON.stringify(stadium),
    });
  }

  async deleteStadium(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.stadiums.detail(id), {
      method: "DELETE",
    });
  }
}

export const stadiumsApiService = new StadiumsApiService();
