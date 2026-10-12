BEGIN;

-- Freeze the affiliation used to attribute goals and assists to each team.
ALTER TABLE PlayerStats ADD COLUMN team_id BIGINT REFERENCES Team(id) ON DELETE RESTRICT;

UPDATE PlayerStats ps
SET team_id = f.team_id
FROM Footballer f, Match m
WHERE f.id = ps.player_id AND m.id = ps.match_id
  AND f.team_id IN (m.home_team_id, m.away_team_id);

-- Existing participation must be resolved explicitly rather than guessed.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM PlayerStats WHERE team_id IS NULL) THEN
        RAISE EXCEPTION 'Hay estadísticas sin equipo participante identificable. Revise la afiliación de esas filas antes de aplicar la migración 000009.';
    END IF;
END;
$$;

ALTER TABLE PlayerStats ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE PlayerStats DROP CONSTRAINT playerstats_player_id_fkey;
ALTER TABLE PlayerStats ADD CONSTRAINT playerstats_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES Player(footballer_id) ON DELETE RESTRICT;

CREATE FUNCTION preserve_player_stats_team() RETURNS TRIGGER AS $$
DECLARE
    player_team BIGINT;
    home_team BIGINT;
    away_team BIGINT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.player_id IS DISTINCT FROM OLD.player_id
           OR NEW.match_id IS DISTINCT FROM OLD.match_id THEN
            RAISE EXCEPTION 'No se puede cambiar el jugador o partido de una estadística registrada' USING ERRCODE = '23514';
        END IF;
        NEW.team_id := OLD.team_id;
        RETURN NEW;
    END IF;

    SELECT home_team_id, away_team_id INTO home_team, away_team
    FROM Match WHERE id = NEW.match_id FOR SHARE;
    SELECT f.team_id INTO player_team
    FROM Footballer f JOIN Player p ON p.footballer_id = f.id
    WHERE f.id = NEW.player_id FOR SHARE OF f;

    IF player_team IS NULL
       OR (player_team IS DISTINCT FROM home_team AND player_team IS DISTINCT FROM away_team) THEN
        RAISE EXCEPTION 'El jugador debe pertenecer a uno de los equipos del partido' USING ERRCODE = '23514';
    END IF;
    NEW.team_id := player_team;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_preserve_player_stats_team
BEFORE INSERT OR UPDATE ON PlayerStats
FOR EACH ROW EXECUTE FUNCTION preserve_player_stats_team();

CREATE FUNCTION preserve_match_participants() RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.home_team_id IS DISTINCT FROM OLD.home_team_id
        OR NEW.away_team_id IS DISTINCT FROM OLD.away_team_id)
       AND EXISTS (SELECT 1 FROM PlayerStats WHERE match_id = OLD.id) THEN
        RAISE EXCEPTION 'No se pueden cambiar los equipos de un partido con estadísticas' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_preserve_match_participants
BEFORE UPDATE OF home_team_id, away_team_id ON Match
FOR EACH ROW EXECUTE FUNCTION preserve_match_participants();

COMMIT;
