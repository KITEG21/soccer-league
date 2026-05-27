import type { Futbolista } from "@/shared/types";

export interface Player extends Futbolista {
  position: string;
  matches_played?: number;
  average_goals_per_match?: number;
}

export interface CreatePlayerRequest {
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
  position: string;
  matches_played?: number;
  average_goals_per_match?: number;
}

export interface UpdatePlayerRequest extends CreatePlayerRequest {}
