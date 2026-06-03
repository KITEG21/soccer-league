import type { Player } from "../../players/types";
import type { Coach } from "../../coaches/types";

export interface Team {
  id: number;
  name: string;
  province?: string;
  mascot?: string;
  color?: string;
  championships_played?: number;
  championships_won?: number;
  players?: Player[];
  coaches?: Coach[];
}

export interface CreateTeamRequest {
  name: string;
  province?: string;
  mascot?: string;
  color?: string;
  championships_played?: number;
  championships_won?: number;
}

export interface UpdateTeamRequest {
  name: string;
  province?: string;
  mascot?: string;
  color?: string;
  championships_played?: number;
  championships_won?: number;
}
