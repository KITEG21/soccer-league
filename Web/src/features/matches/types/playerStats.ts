export interface PlayerStat {
  id: number;
  player_id: number;
  match_id: number;
  goals_scored: number;
  assists: number;
  shots_on_goal: number;
  passes_completed: number;
  interceptions: number;
  tackles: number;
  blocks: number;
  saves: number;
  goals_conceded: number;
}

export interface CreatePlayerStatRequest {
  player_id: number;
  match_id: number;
  goals_scored: number;
  assists: number;
  shots_on_goal: number;
  passes_completed: number;
  interceptions: number;
  tackles: number;
  blocks: number;
  saves: number;
  goals_conceded: number;
}

export interface UpdatePlayerStatRequest extends CreatePlayerStatRequest {}
