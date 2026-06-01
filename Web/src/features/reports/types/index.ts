export interface StandingRow {
  team_id: number;
  name: string;
  points: number;
}

export interface HeadToHeadMatch {
  id: number;
  match_date: string;
  stadium_name: string;
  home_team_name: string;
  away_team_name: string;
  home_goals: number;
  away_goals: number;
  home_assists: number;
  away_assists: number;
}

export interface MatchByDateRow {
  id: number;
  match_date: string;
  stadium_name: string;
  home_team_name: string;
  away_team_name: string;
  home_goals: number;
  away_goals: number;
  attendance: number;
}

export interface CoachExperience {
  name: string;
  number: number;
  experience_years: number;
  championships_won: number;
  team_name: string;
}

export interface StadiumAttendance {
  id: number;
  name: string;
  capacity: number;
  total_attendance: number;
  total_matches: number;
  attendance_percentage: number;
}

export interface TeamStatusReport {
  team_id: number;
  name: string;
  home_wins: number;
  home_draws: number;
  home_losses: number;
  away_wins: number;
  away_draws: number;
  away_losses: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
}

export interface AllStarPlayer {
  position: string;
  player_name: string;
  team_name: string;
  metric_name: string;
  metric_value: number;
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
