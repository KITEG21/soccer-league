import type { Footballer } from "@/shared/types";
import type { Team } from "@/features/teams/types";

export interface Player extends Footballer {
  position: string;
  team?: Team;
}

export interface CreatePlayerRequest {
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
  position: string;
}

export interface UpdatePlayerRequest extends CreatePlayerRequest {}
