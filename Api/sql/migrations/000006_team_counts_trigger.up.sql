-- Trigger: update players_count on Team when a Player is inserted/deleted
CREATE OR REPLACE FUNCTION update_team_players_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE Team
        SET players_count = players_count + 1
        WHERE id = (SELECT team_id FROM Footballer WHERE id = NEW.footballer_id)
          AND (SELECT team_id FROM Footballer WHERE id = NEW.footballer_id) IS NOT NULL;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE Team
        SET players_count = GREATEST(players_count - 1, 0)
        WHERE id = (SELECT team_id FROM Footballer WHERE id = OLD.footballer_id)
          AND (SELECT team_id FROM Footballer WHERE id = OLD.footballer_id) IS NOT NULL;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_players_count ON Player;
CREATE TRIGGER trigger_update_team_players_count
AFTER INSERT OR DELETE ON Player
FOR EACH ROW EXECUTE FUNCTION update_team_players_count();

-- Trigger: update coaches_count on Team when a Coach is inserted/deleted
CREATE OR REPLACE FUNCTION update_team_coaches_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE Team
        SET coaches_count = coaches_count + 1
        WHERE id = (SELECT team_id FROM Footballer WHERE id = NEW.footballer_id)
          AND (SELECT team_id FROM Footballer WHERE id = NEW.footballer_id) IS NOT NULL;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE Team
        SET coaches_count = GREATEST(coaches_count - 1, 0)
        WHERE id = (SELECT team_id FROM Footballer WHERE id = OLD.footballer_id)
          AND (SELECT team_id FROM Footballer WHERE id = OLD.footballer_id) IS NOT NULL;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_coaches_count ON Coach;
CREATE TRIGGER trigger_update_team_coaches_count
AFTER INSERT OR DELETE ON Coach
FOR EACH ROW EXECUTE FUNCTION update_team_coaches_count();
