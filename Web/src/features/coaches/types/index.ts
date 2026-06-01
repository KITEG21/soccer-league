import type { Footballer } from "@/shared/types";
import type { Team } from "@/features/teams/types";

export interface Coach extends Footballer {
  experience_years?: number;
  championships_won?: number;
  team?: Team;
}

export interface CreateCoachRequest {
  team_id?: number;
  name: string;
  number?: number;
  years_in_team?: number;
  experience_years?: number;
  championships_won?: number;
}

export interface UpdateCoachRequest extends CreateCoachRequest {}
