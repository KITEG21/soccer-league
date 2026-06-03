DROP TRIGGER IF EXISTS trigger_update_team_players_count ON Player;
DROP TRIGGER IF EXISTS trigger_update_team_coaches_count ON Coach;
DROP FUNCTION IF EXISTS update_team_players_count();
DROP FUNCTION IF EXISTS update_team_coaches_count();
