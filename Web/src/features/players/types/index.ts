import type { Futbolista } from "@/shared/types";

export interface Player extends Futbolista {
  position_id?: number;
  matches_played?: number;
  goals?: number;
  assists?: number;
}

export interface CreatePlayerRequest {
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
  position_id?: number;
  matches_played?: number;
  goals?: number;
  assists?: number;
}
