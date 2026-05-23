import type { Futbolista } from "@/shared/types";

export interface Coach extends Futbolista {
  experience_years?: number;
}

export interface CreateCoachRequest {
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
  experience_years?: number;
}
