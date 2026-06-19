import type { Stadium, CreateStadiumRequest, UpdateStadiumRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";

class StadiumsApiService {
  async getStadiums(): Promise<Stadium[]> {
    const res = await apiRequest<PaginatedResponse<Stadium>>("/stadiums?limit=100");
    return res.data;
  }

  async getStadiumsPage(page: number, pageSize: number): Promise<PaginatedResponse<Stadium>> {
    const offset = (page - 1) * pageSize;
    return apiRequest<PaginatedResponse<Stadium>>(`/stadiums?limit=${pageSize}&offset=${offset}`);
  }

  async getStadium(id: number): Promise<Stadium> {
    return apiRequest<Stadium>(`/stadiums/${id}`);
  }

  async createStadium(stadium: CreateStadiumRequest): Promise<Stadium> {
    return apiRequest<Stadium>("/stadiums", {
      method: "POST",
      body: JSON.stringify(stadium),
    });
  }

  async updateStadium(id: number, stadium: UpdateStadiumRequest): Promise<Stadium> {
    return apiRequest<Stadium>(`/stadiums/${id}`, {
      method: "PUT",
      body: JSON.stringify(stadium),
    });
  }

  async deleteStadium(id: number): Promise<void> {
    return apiRequest<void>(`/stadiums/${id}`, {
      method: "DELETE",
    });
  }
}

export const stadiumsApiService = new StadiumsApiService();
