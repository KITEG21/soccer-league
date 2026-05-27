import type { Coach, CreateCoachRequest, UpdateCoachRequest } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://soccer-league-1.onrender.com";

class CoachesApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return undefined as T;
    }

    return response.json();
  }

  async getCoaches(): Promise<Coach[]> {
    return this.request<Coach[]>("/coaches");
  }

  async getCoach(id: number): Promise<Coach> {
    return this.request<Coach>(`/coaches/${id}`);
  }

  async createCoach(coach: CreateCoachRequest): Promise<Coach> {
    return this.request<Coach>("/coaches", {
      method: "POST",
      body: JSON.stringify(coach),
    });
  }

  async updateCoach(id: number, coach: UpdateCoachRequest): Promise<void> {
    return this.request<void>(`/coaches/${id}`, {
      method: "PUT",
      body: JSON.stringify(coach),
    });
  }

  async deleteCoach(id: number): Promise<void> {
    return this.request<void>(`/coaches/${id}`, {
      method: "DELETE",
    });
  }
}

export const coachesApiService = new CoachesApiService();
