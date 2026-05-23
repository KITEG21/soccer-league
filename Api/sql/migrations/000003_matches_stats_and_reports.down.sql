DROP TRIGGER IF EXISTS trigger_validate_match_date ON Match;
DROP FUNCTION IF EXISTS validate_match_date();

DROP TABLE IF EXISTS PlayerStats;
DROP TABLE IF EXISTS Match;

CREATE TABLE IF NOT EXISTS Position (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

ALTER TABLE Player
    ADD COLUMN IF NOT EXISTS position_id BIGINT REFERENCES Position(id),
    ADD COLUMN IF NOT EXISTS goals INT,
    ADD COLUMN IF NOT EXISTS assists INT;

ALTER TABLE Player
    ALTER COLUMN position DROP NOT NULL;

ALTER TABLE Player
    DROP COLUMN IF EXISTS position,
    DROP COLUMN IF EXISTS average_goals_per_match;

ALTER TABLE Coach
    DROP COLUMN IF EXISTS championships_won;
