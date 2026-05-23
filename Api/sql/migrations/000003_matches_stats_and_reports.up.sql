ALTER TABLE Coach
    ADD COLUMN IF NOT EXISTS championships_won INT DEFAULT 0;

ALTER TABLE Player
    ADD COLUMN IF NOT EXISTS position TEXT;

UPDATE Player p
SET position = COALESCE(pos.name, 'Unknown')
FROM Position pos
WHERE p.position_id = pos.id
  AND (p.position IS NULL OR p.position = '');

UPDATE Player
SET position = 'Unknown'
WHERE position IS NULL OR position = '';

ALTER TABLE Player
    ALTER COLUMN position SET NOT NULL;

ALTER TABLE Player
    ADD COLUMN IF NOT EXISTS average_goals_per_match DOUBLE PRECISION DEFAULT 0;

ALTER TABLE Player
    ALTER COLUMN average_goals_per_match SET DEFAULT 0;

CREATE TABLE IF NOT EXISTS Match (
    id BIGSERIAL PRIMARY KEY,
    home_team_id BIGINT REFERENCES Team(id) ON DELETE RESTRICT,
    away_team_id BIGINT REFERENCES Team(id) ON DELETE RESTRICT,
    season_id BIGINT REFERENCES Season(id) ON DELETE RESTRICT,
    stadium_id BIGINT REFERENCES Stadium(id) ON DELETE RESTRICT,
    match_date DATE NOT NULL,
    home_goals INT DEFAULT 0,
    away_goals INT DEFAULT 0,
    attendance INT DEFAULT 0,
    CONSTRAINT match_distinct_teams CHECK (home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id)
);

CREATE TABLE IF NOT EXISTS PlayerStats (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT REFERENCES Player(footballer_id) ON DELETE CASCADE,
    match_id BIGINT REFERENCES Match(id) ON DELETE CASCADE,
    goals_scored INT DEFAULT 0,
    assists INT DEFAULT 0,
    shots_on_goal INT DEFAULT 0,
    passes_completed INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    tackles INT DEFAULT 0,
    blocks INT DEFAULT 0,
    saves INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    UNIQUE(player_id, match_id)
);

CREATE OR REPLACE FUNCTION validate_match_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.season_id IS NULL THEN
        RAISE EXCEPTION 'La temporada del partido es obligatoria';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM Season
        WHERE id = NEW.season_id
          AND start_date <= NEW.match_date
          AND end_date >= NEW.match_date
    ) THEN
        RAISE EXCEPTION 'La fecha del partido debe estar dentro del rango de la temporada';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_match_date ON Match;
CREATE TRIGGER trigger_validate_match_date
BEFORE INSERT OR UPDATE ON Match
FOR EACH ROW EXECUTE FUNCTION validate_match_date();

ALTER TABLE Player
    DROP COLUMN IF EXISTS position_id,
    DROP COLUMN IF EXISTS goals,
    DROP COLUMN IF EXISTS assists;

DROP TABLE IF EXISTS Position;
