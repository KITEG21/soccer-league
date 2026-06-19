import type { PlayerStat, CreatePlayerStatRequest, UpdatePlayerStatRequest } from "../types/playerStats";
import { apiRequest } from "@/shared/utils/api-client";

class PlayerStatsApiService {
  async getPlayerStats(): Promise<PlayerStat[]> {
    return apiRequest<PlayerStat[]>("/player-stats");
  }

  async getPlayerStatsByMatch(matchId: number): Promise<PlayerStat[]> {
    return apiRequest<PlayerStat[]>(`/player-stats?match_id=${matchId}`);
  }

  async getPlayerStat(id: number): Promise<PlayerStat> {
    return apiRequest<PlayerStat>(`/player-stats/${id}`);
  }

  async createPlayerStat(stat: CreatePlayerStatRequest): Promise<PlayerStat> {
    return apiRequest<PlayerStat>("/player-stats", {
      method: "POST",
      body: JSON.stringify(stat),
    });
  }

  async updatePlayerStat(id: number, stat: UpdatePlayerStatRequest): Promise<void> {
    return apiRequest<void>(`/player-stats/${id}`, {
      method: "PUT",
      body: JSON.stringify(stat),
    });
  }

  async deletePlayerStat(id: number): Promise<void> {
    return apiRequest<void>(`/player-stats/${id}`, {
      method: "DELETE",
    });
  }
}

export const playerStatsApiService = new PlayerStatsApiService();
