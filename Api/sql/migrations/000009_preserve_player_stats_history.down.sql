BEGIN;
DROP TRIGGER IF EXISTS trigger_preserve_match_participants ON Match;
DROP FUNCTION IF EXISTS preserve_match_participants();
DROP TRIGGER IF EXISTS trigger_preserve_player_stats_team ON PlayerStats;
DROP FUNCTION IF EXISTS preserve_player_stats_team();
ALTER TABLE PlayerStats DROP CONSTRAINT playerstats_player_id_fkey;
ALTER TABLE PlayerStats ADD CONSTRAINT playerstats_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES Player(footballer_id) ON DELETE CASCADE;
ALTER TABLE PlayerStats DROP COLUMN team_id;
COMMIT;
