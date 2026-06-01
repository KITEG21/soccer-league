export interface Team {
  id: number;
  name: string;
  province?: string;
  mascot?: string;
  color?: string;
  championships_played?: number;
  championships_won?: number;
  players_count?: number;
  coaches_count?: number;
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
