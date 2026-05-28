-- Remove UNIQUE constraint for (team_id, number) in Footballer
ALTER TABLE Footballer
DROP CONSTRAINT IF EXISTS unique_team_number;

-- Add back columns to Player
ALTER TABLE Player
ADD COLUMN IF NOT EXISTS matches_played INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_goals_per_match DOUBLE PRECISION DEFAULT 0;

-- Remove columns from Team
ALTER TABLE Team
DROP COLUMN IF EXISTS players_count,
DROP COLUMN IF EXISTS coaches_count;
