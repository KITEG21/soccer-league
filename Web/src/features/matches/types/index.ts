import type { Team } from "../../teams/types";
import type { Season } from "../../seasons/types";
import type { Stadium } from "../../stadiums/types";

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  season_id: number;
  stadium_id: number;
  match_date: string;
  home_goals: number;
  away_goals: number;
  attendance?: number;
  
  // Relations (optional depending on API response)
  home_team?: Team;
  away_team?: Team;
  season?: Season;
  stadium?: Stadium;
}

export interface CreateMatchRequest {
  home_team_id: number;
  away_team_id: number;
  season_id: number;
  stadium_id: number;
  match_date: string;
  home_goals: number;
  away_goals: number;
  attendance?: number;
}

export interface UpdateMatchRequest extends CreateMatchRequest {}
