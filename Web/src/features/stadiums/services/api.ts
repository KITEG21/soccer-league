import type { Stadium, CreateStadiumRequest, UpdateStadiumRequest } from "../types";
import { apiRequest } from "@/shared/utils/api-client";

class StadiumsApiService {
  async getStadiums(): Promise<Stadium[]> {
    return apiRequest<Stadium[]>("/stadiums?limit=100");
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
