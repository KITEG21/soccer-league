ALTER TABLE Futbolista RENAME TO Footballer;

ALTER TABLE Player RENAME COLUMN futbolista_id TO footballer_id;
ALTER TABLE Coach RENAME COLUMN futbolista_id TO footballer_id;

ALTER TABLE Team
    ADD CONSTRAINT team_name_unique UNIQUE (name);

ALTER TABLE Stadium
    ADD CONSTRAINT stadium_name_unique UNIQUE (name);