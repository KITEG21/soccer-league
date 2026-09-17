import type { Coach, CreateCoachRequest, UpdateCoachRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class CoachesApiService {
  async getCoaches(): Promise<Coach[]> {
    const res = await apiRequest<PaginatedResponse<Coach>>(API_ROUTES.coaches.collection({ limit: 100 }));
    return res.data;
  }

  async getCoachesPage(params: ListApiParams): Promise<PaginatedResponse<Coach>> {
    return apiRequest<PaginatedResponse<Coach>>(API_ROUTES.coaches.collection(params));
  }

  async getCoach(id: number): Promise<Coach> {
    return apiRequest<Coach>(API_ROUTES.coaches.detail(id));
  }

  async createCoach(coach: CreateCoachRequest): Promise<Coach> {
    return apiRequest<Coach>(API_ROUTES.coaches.collection(), {
      method: "POST",
      body: JSON.stringify(coach),
    });
  }

  async updateCoach(id: number, coach: UpdateCoachRequest): Promise<void> {
    return apiRequest<void>(API_ROUTES.coaches.detail(id), {
      method: "PUT",
      body: JSON.stringify(coach),
    });
  }

  async deleteCoach(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.coaches.detail(id), {
      method: "DELETE",
    });
  }
}

export const coachesApiService = new CoachesApiService();
