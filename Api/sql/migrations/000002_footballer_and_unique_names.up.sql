DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = 'futbolista'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = 'footballer'
    ) THEN
        EXECUTE 'ALTER TABLE futbolista RENAME TO footballer';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'player'
          AND column_name = 'futbolista_id'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'player'
          AND column_name = 'footballer_id'
    ) THEN
        EXECUTE 'ALTER TABLE player RENAME COLUMN futbolista_id TO footballer_id';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'coach'
          AND column_name = 'futbolista_id'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'coach'
          AND column_name = 'footballer_id'
    ) THEN
        EXECUTE 'ALTER TABLE coach RENAME COLUMN futbolista_id TO footballer_id';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS team_name_unique ON Team (name);
CREATE UNIQUE INDEX IF NOT EXISTS stadium_name_unique ON Stadium (name);