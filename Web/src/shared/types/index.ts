// Shared types used across multiple modules
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
