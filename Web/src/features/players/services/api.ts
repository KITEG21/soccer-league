import type { Player, CreatePlayerRequest, UpdatePlayerRequest } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://soccer-league-1.onrender.com";

class PlayersApiService {
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

  async getPlayers(): Promise<Player[]> {
    return this.request<Player[]>("/players");
  }

  async getPlayer(id: number): Promise<Player> {
    return this.request<Player>(`/players/${id}`);
  }

  async createPlayer(player: CreatePlayerRequest): Promise<Player> {
    return this.request<Player>("/players", {
      method: "POST",
      body: JSON.stringify(player),
    });
  }

  async updatePlayer(id: number, player: UpdatePlayerRequest): Promise<void> {
    return this.request<void>(`/players/${id}`, {
      method: "PUT",
      body: JSON.stringify(player),
    });
  }

  async deletePlayer(id: number): Promise<void> {
    return this.request<void>(`/players/${id}`, {
      method: "DELETE",
    });
  }
}

export const playersApiService = new PlayersApiService();
