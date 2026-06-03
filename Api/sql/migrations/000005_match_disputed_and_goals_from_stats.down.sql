-- Drop triggers
DROP TRIGGER IF EXISTS trigger_validate_match_disputed ON PlayerStats;
DROP TRIGGER IF EXISTS trigger_prevent_match_disputed_change ON Match;
DROP TRIGGER IF EXISTS trigger_prevent_match_delete_with_stats ON Match;

-- Drop functions
DROP FUNCTION IF EXISTS validate_match_disputed();
DROP FUNCTION IF EXISTS prevent_match_disputed_change();
DROP FUNCTION IF EXISTS prevent_match_delete_with_stats();

-- Restore goal columns to Match
ALTER TABLE Match
ADD COLUMN home_goals INT DEFAULT 0;

ALTER TABLE Match
ADD COLUMN away_goals INT DEFAULT 0;

-- Remove disputed column
ALTER TABLE Match
DROP COLUMN IF EXISTS disputed;
