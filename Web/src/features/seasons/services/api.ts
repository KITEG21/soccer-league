import type { Season, CreateSeasonRequest, UpdateSeasonRequest } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://soccer-league-1.onrender.com";

class SeasonsApiService {
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

    // Handle empty responses (like DELETE requests)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return undefined as T;
    }

    return response.json();
  }

  async getSeasons(): Promise<Season[]> {
    return this.request<Season[]>("/seasons");
  }

  async getSeason(id: number): Promise<Season> {
    return this.request<Season>(`/seasons/${id}`);
  }

  async createSeason(season: CreateSeasonRequest): Promise<Season> {
    return this.request<Season>("/seasons", {
      method: "POST",
      body: JSON.stringify(season),
    });
  }

  async updateSeason(id: number, season: UpdateSeasonRequest): Promise<Season> {
    return this.request<Season>(`/seasons/${id}`, {
      method: "PUT",
      body: JSON.stringify(season),
    });
  }

  async deleteSeason(id: number): Promise<void> {
    return this.request<void>(`/seasons/${id}`, {
      method: "DELETE",
    });
  }
}

export const seasonsApiService = new SeasonsApiService();
