DROP TRIGGER IF EXISTS trigger_update_team_players_count ON Player;
DROP TRIGGER IF EXISTS trigger_update_team_coaches_count ON Coach;
DROP FUNCTION IF EXISTS update_team_players_count();
DROP FUNCTION IF EXISTS update_team_coaches_count();

ALTER TABLE Team DROP COLUMN IF EXISTS players_count;
ALTER TABLE Team DROP COLUMN IF EXISTS coaches_count;
