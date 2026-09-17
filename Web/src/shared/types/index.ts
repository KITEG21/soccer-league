// Shared types used across multiple modules
export interface Footballer {
  id: number;
  team_id?: number;
  team_name?: string;
  name: string;
  number?: number;
  years_in_team?: number;
}

export interface Position {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
