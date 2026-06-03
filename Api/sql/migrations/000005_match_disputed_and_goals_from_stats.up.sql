-- Add disputed boolean column to Match
ALTER TABLE Match
ADD COLUMN disputed BOOLEAN NOT NULL DEFAULT FALSE;

-- Remove goal columns from Match (goals come from PlayerStats now)
ALTER TABLE Match
DROP COLUMN IF EXISTS home_goals;

ALTER TABLE Match
DROP COLUMN IF EXISTS away_goals;

-- Update CHECK constraint (no longer references home_goals/away_goals)
ALTER TABLE Match
DROP CONSTRAINT IF EXISTS match_distinct_teams;

ALTER TABLE Match
ADD CONSTRAINT match_distinct_teams CHECK (home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id);

-- Trigger: validate match is disputed before allowing PlayerStats operations
CREATE OR REPLACE FUNCTION validate_match_disputed()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Match WHERE id = NEW.match_id AND disputed = TRUE
    ) THEN
        RAISE EXCEPTION 'No se pueden agregar estadisticas a un partido no disputado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_match_disputed ON PlayerStats;
CREATE TRIGGER trigger_validate_match_disputed
BEFORE INSERT OR UPDATE ON PlayerStats
FOR EACH ROW EXECUTE FUNCTION validate_match_disputed();

-- Trigger: prevent changing disputed from true to false if PlayerStats exist
CREATE OR REPLACE FUNCTION prevent_match_disputed_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.disputed = TRUE AND NEW.disputed = FALSE THEN
        IF EXISTS (
            SELECT 1 FROM PlayerStats WHERE match_id = OLD.id
        ) THEN
            RAISE EXCEPTION 'No se puede cambiar a no disputado un partido que ya tiene estadisticas';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_match_disputed_change ON Match;
CREATE TRIGGER trigger_prevent_match_disputed_change
BEFORE UPDATE OF disputed ON Match
FOR EACH ROW EXECUTE FUNCTION prevent_match_disputed_change();

-- Trigger: prevent deleting match if PlayerStats exist
CREATE OR REPLACE FUNCTION prevent_match_delete_with_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM PlayerStats WHERE match_id = OLD.id
    ) THEN
        RAISE EXCEPTION 'No se puede eliminar un partido que tiene estadisticas';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_match_delete_with_stats ON Match;
CREATE TRIGGER trigger_prevent_match_delete_with_stats
BEFORE DELETE ON Match
FOR EACH ROW EXECUTE FUNCTION prevent_match_delete_with_stats();
