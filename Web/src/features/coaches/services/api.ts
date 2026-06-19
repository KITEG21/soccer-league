import type { Coach, CreateCoachRequest, UpdateCoachRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";

class CoachesApiService {
  async getCoaches(): Promise<Coach[]> {
    const res = await apiRequest<PaginatedResponse<Coach>>("/coaches?limit=100");
    return res.data;
  }

  async getCoachesPage(page: number, pageSize: number): Promise<PaginatedResponse<Coach>> {
    const offset = (page - 1) * pageSize;
    return apiRequest<PaginatedResponse<Coach>>(`/coaches?limit=${pageSize}&offset=${offset}`);
  }

  async getCoach(id: number): Promise<Coach> {
    return apiRequest<Coach>(`/coaches/${id}`);
  }

  async createCoach(coach: CreateCoachRequest): Promise<Coach> {
    return apiRequest<Coach>("/coaches", {
      method: "POST",
      body: JSON.stringify(coach),
    });
  }

  async updateCoach(id: number, coach: UpdateCoachRequest): Promise<void> {
    return apiRequest<void>(`/coaches/${id}`, {
      method: "PUT",
      body: JSON.stringify(coach),
    });
  }

  async deleteCoach(id: number): Promise<void> {
    return apiRequest<void>(`/coaches/${id}`, {
      method: "DELETE",
    });
  }
}

export const coachesApiService = new CoachesApiService();
