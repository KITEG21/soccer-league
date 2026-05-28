-- Add players_count and coaches_count to Team
ALTER TABLE Team
ADD COLUMN IF NOT EXISTS players_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS coaches_count INT DEFAULT 0;

-- Add UNIQUE constraint for (team_id, number) in Footballer
-- If there are duplicate jersey numbers in the same team, keep the first row and null out the duplicate numbers
WITH duplicate_footballers AS (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY team_id, number ORDER BY id) AS rn
        FROM Footballer
        WHERE team_id IS NOT NULL AND number IS NOT NULL
    ) t
    WHERE t.rn > 1
)
UPDATE Footballer
SET number = NULL
WHERE id IN (SELECT id FROM duplicate_footballers);

ALTER TABLE Footballer
ADD CONSTRAINT unique_team_number UNIQUE (team_id, number);

-- Remove columns from Player that should be calculated
ALTER TABLE Player
DROP COLUMN IF EXISTS matches_played,
DROP COLUMN IF EXISTS average_goals_per_match;
