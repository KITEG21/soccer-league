export interface Team {
  id: number;
  name: string;
  province?: string;
  mascot?: string;
  color?: string;
  championships_played?: number;
  championships_won?: number;
}

export interface Stadium {
  id: number;
  name: string;
  capacity: number;
}

export interface Season {
  id: number;
  start_date?: string;
  end_date?: string;
}

export interface Futbolista {
  id: number;
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
}

export interface Position {
  id: number;
  name: string;
}

export interface Player extends Futbolista {
  position_id?: number;
  matches_played?: number;
  goals?: number;
  assists?: number;
}

export interface Coach extends Futbolista {
  experience_years?: number;
}
