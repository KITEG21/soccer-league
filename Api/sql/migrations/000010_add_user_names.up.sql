BEGIN;
ALTER TABLE Users
    ADD COLUMN first_name TEXT NOT NULL DEFAULT '' CHECK (char_length(first_name) <= 100),
    ADD COLUMN last_name TEXT NOT NULL DEFAULT '' CHECK (char_length(last_name) <= 100);
COMMIT;
