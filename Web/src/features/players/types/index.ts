import type { Footballer } from "@/shared/types";

export interface Player extends Footballer {
  position: string;
}

export interface CreatePlayerRequest {
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
  position: string;
}

export interface UpdatePlayerRequest extends CreatePlayerRequest {}
