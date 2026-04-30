-- Team CRUD
-- name: CreateTeam :one
INSERT INTO Team (name, province, mascot, color, championships_played, championships_won)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;

-- name: GetTeam :one
SELECT id, name, province, mascot, color, championships_played, championships_won
FROM Team
WHERE id = $1;

-- name: ListTeams :many
SELECT id, name, province, mascot, color, championships_played, championships_won
FROM Team
ORDER BY id;

-- name: UpdateTeam :exec
UPDATE Team
SET name = $2, province = $3, mascot = $4, color = $5, championships_played = $6, championships_won = $7
WHERE id = $1;

-- name: DeleteTeam :exec
DELETE FROM Team WHERE id = $1;

-- Stadium CRUD
-- name: CreateStadium :one
INSERT INTO Stadium (name, capacity)
VALUES ($1, $2)
RETURNING id;

-- name: GetStadium :one
SELECT id, name, capacity FROM Stadium WHERE id = $1;

-- name: ListStadiums :many
SELECT id, name, capacity FROM Stadium ORDER BY id;

-- name: UpdateStadium :exec
UPDATE Stadium SET name = $2, capacity = $3 WHERE id = $1;

-- name: DeleteStadium :exec
DELETE FROM Stadium WHERE id = $1;

-- Season CRUD
-- name: CreateSeason :one
INSERT INTO Season (start_date, end_date)
VALUES ($1, $2)
RETURNING id;

-- name: GetSeason :one
SELECT id, start_date, end_date FROM Season WHERE id = $1;

-- name: ListSeasons :many
SELECT id, start_date, end_date FROM Season ORDER BY id;

-- name: UpdateSeason :exec
UPDATE Season SET start_date = $2, end_date = $3 WHERE id = $1;

-- name: DeleteSeason :exec
DELETE FROM Season WHERE id = $1;

-- Futbolista (internal, used by Player/Coach)
-- name: CreateFutbolista :one
INSERT INTO Futbolista (team_id, name, number, years_in_team)
VALUES ($1, $2, $3, $4)
RETURNING id;

-- name: GetFutbolista :one
SELECT id, team_id, name, number, years_in_team FROM Futbolista WHERE id = $1;

-- name: DeleteFutbolista :exec
DELETE FROM Futbolista WHERE id = $1;

-- Player CRUD (atomic with transaction via WITH clause)
-- name: CreatePlayer :one
WITH ins_fut AS (
    INSERT INTO Futbolista (team_id, name, number, years_in_team)
    VALUES ($1, $2, $3, $4)
    RETURNING id
)
INSERT INTO Player (futbolista_id, position_id, matches_played, goals, assists)
SELECT id, $5, $6, $7, $8 FROM ins_fut
RETURNING futbolista_id;

-- name: GetPlayer :one
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       p.position_id, p.matches_played, p.goals, p.assists
FROM Futbolista f
JOIN Player p ON p.futbolista_id = f.id
WHERE f.id = $1;

-- name: ListPlayers :many
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       p.position_id, p.matches_played, p.goals, p.assists
FROM Futbolista f
JOIN Player p ON p.futbolista_id = f.id
ORDER BY f.id;

-- name: UpdatePlayerFutbolista :exec
UPDATE Futbolista
SET team_id = $2, name = $3, number = $4, years_in_team = $5
WHERE id = $1;

-- name: UpdatePlayerStats :exec
UPDATE Player
SET position_id = $2, matches_played = $3, goals = $4, assists = $5
WHERE futbolista_id = $1;

-- name: DeletePlayerRecord :exec
DELETE FROM Player WHERE futbolista_id = $1;

-- Coach CRUD (atomic with transaction via WITH clause)
-- name: CreateCoach :one
WITH ins_fut AS (
    INSERT INTO Futbolista (team_id, name, number, years_in_team)
    VALUES ($1, $2, $3, $4)
    RETURNING id
)
INSERT INTO Coach (futbolista_id, experience_years)
SELECT id, $5 FROM ins_fut
RETURNING futbolista_id;

-- name: GetCoach :one
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       c.experience_years
FROM Futbolista f
JOIN Coach c ON c.futbolista_id = f.id
WHERE f.id = $1;

-- name: ListCoaches :many
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       c.experience_years
FROM Futbolista f
JOIN Coach c ON c.futbolista_id = f.id
ORDER BY f.id;

-- name: UpdateCoachFutbolista :exec
UPDATE Futbolista
SET team_id = $2, name = $3, number = $4, years_in_team = $5
WHERE id = $1;

-- name: UpdateCoachExperience :exec
UPDATE Coach
SET experience_years = $2
WHERE futbolista_id = $1;

-- name: DeleteCoachRecord :exec
DELETE FROM Coach WHERE futbolista_id = $1;
