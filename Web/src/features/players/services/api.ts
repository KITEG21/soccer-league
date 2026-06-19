import type { Player, CreatePlayerRequest, UpdatePlayerRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";

class PlayersApiService {
  async getPlayers(): Promise<Player[]> {
    const res = await apiRequest<PaginatedResponse<Player>>("/players?limit=100");
    return res.data;
  }

  async getPlayersPage(page: number, pageSize: number): Promise<PaginatedResponse<Player>> {
    const offset = (page - 1) * pageSize;
    return apiRequest<PaginatedResponse<Player>>(`/players?limit=${pageSize}&offset=${offset}`);
  }

  async getPlayer(id: number): Promise<Player> {
    return apiRequest<Player>(`/players/${id}`);
  }

  async createPlayer(player: CreatePlayerRequest): Promise<Player> {
    return apiRequest<Player>("/players", {
      method: "POST",
      body: JSON.stringify(player),
    });
  }

  async updatePlayer(id: number, player: UpdatePlayerRequest): Promise<void> {
    return apiRequest<void>(`/players/${id}`, {
      method: "PUT",
      body: JSON.stringify(player),
    });
  }

  async deletePlayer(id: number): Promise<void> {
    return apiRequest<void>(`/players/${id}`, {
      method: "DELETE",
    });
  }
}

export const playersApiService = new PlayersApiService();
