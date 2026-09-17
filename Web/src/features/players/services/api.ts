import type { Player, CreatePlayerRequest, UpdatePlayerRequest } from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class PlayersApiService {
  async getPlayers(): Promise<Player[]> {
    const res = await apiRequest<PaginatedResponse<Player>>(API_ROUTES.players.collection({ limit: 100 }));
    return res.data;
  }

  async getPlayersPage(params: ListApiParams): Promise<PaginatedResponse<Player>> {
    return apiRequest<PaginatedResponse<Player>>(API_ROUTES.players.collection(params));
  }

  async getPlayer(id: number): Promise<Player> {
    return apiRequest<Player>(API_ROUTES.players.detail(id));
  }

  async createPlayer(player: CreatePlayerRequest): Promise<Player> {
    return apiRequest<Player>(API_ROUTES.players.collection(), {
      method: "POST",
      body: JSON.stringify(player),
    });
  }

  async updatePlayer(id: number, player: UpdatePlayerRequest): Promise<void> {
    return apiRequest<void>(API_ROUTES.players.detail(id), {
      method: "PUT",
      body: JSON.stringify(player),
    });
  }

  async deletePlayer(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.players.detail(id), {
      method: "DELETE",
    });
  }
}

export const playersApiService = new PlayersApiService();
