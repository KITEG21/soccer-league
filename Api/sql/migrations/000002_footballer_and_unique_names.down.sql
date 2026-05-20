DROP INDEX IF EXISTS stadium_name_unique;
DROP INDEX IF EXISTS team_name_unique;

ALTER TABLE Coach RENAME COLUMN footballer_id TO futbolista_id;
ALTER TABLE Player RENAME COLUMN footballer_id TO futbolista_id;

ALTER TABLE Footballer RENAME TO Futbolista;