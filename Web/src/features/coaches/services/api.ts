import type { Coach, CreateCoachRequest, UpdateCoachRequest } from "../types";
import { apiRequest } from "@/shared/utils/api-client";

class CoachesApiService {
  async getCoaches(): Promise<Coach[]> {
    return apiRequest<Coach[]>("/coaches");
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
