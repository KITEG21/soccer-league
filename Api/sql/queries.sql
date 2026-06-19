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

-- Footballer (internal, used by Player/Coach)
-- name: CreateFootballer :one
INSERT INTO Footballer (team_id, name, number, years_in_team)
VALUES ($1, $2, $3, $4)
RETURNING id;

-- name: GetFootballer :one
SELECT id, team_id, name, number, years_in_team FROM Footballer WHERE id = $1;

-- name: DeleteFootballer :exec
DELETE FROM Footballer WHERE id = $1;

-- Player CRUD
-- name: CreatePlayer :one
WITH ins_fut AS (
    INSERT INTO Footballer (team_id, name, number, years_in_team)
    VALUES ($1, $2, $3, $4)
    RETURNING id
)
INSERT INTO Player (footballer_id, position)
SELECT id, $5 FROM ins_fut
RETURNING footballer_id;

-- name: GetPlayer :one
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       p.position
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
WHERE f.id = $1;

-- name: ListPlayers :many
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       p.position
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
ORDER BY f.id;

-- name: ListPlayersByTeam :many
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       p.position
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
WHERE f.team_id = $1
ORDER BY f.id;

-- name: UpdatePlayerFootballer :exec
UPDATE Footballer
SET team_id = $2, name = $3, number = $4, years_in_team = $5
WHERE id = $1;

-- name: UpdatePlayerDetails :exec
UPDATE Player
SET position = $2
WHERE footballer_id = $1;

-- name: DeletePlayerRecord :exec
DELETE FROM Player WHERE footballer_id = $1;

-- Coach CRUD
-- name: CreateCoach :one
WITH ins_fut AS (
    INSERT INTO Footballer (team_id, name, number, years_in_team)
    VALUES ($1, $2, $3, $4)
    RETURNING id
)
INSERT INTO Coach (footballer_id, experience_years, championships_won)
SELECT id, $5, $6 FROM ins_fut
RETURNING footballer_id;

-- name: GetCoach :one
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       c.experience_years, c.championships_won
FROM Footballer f
JOIN Coach c ON c.footballer_id = f.id
WHERE f.id = $1;

-- name: ListCoaches :many
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       c.experience_years, c.championships_won
FROM Footballer f
JOIN Coach c ON c.footballer_id = f.id
ORDER BY f.id;

-- name: ListCoachesByTeam :many
SELECT f.id, f.team_id, f.name, f.number, f.years_in_team,
       c.experience_years, c.championships_won
FROM Footballer f
JOIN Coach c ON c.footballer_id = f.id
WHERE f.team_id = $1
ORDER BY f.id;

-- name: UpdateCoachFootballer :exec
UPDATE Footballer
SET team_id = $2, name = $3, number = $4, years_in_team = $5
WHERE id = $1;

-- name: UpdateCoachDetails :exec
UPDATE Coach
SET experience_years = $2, championships_won = $3
WHERE footballer_id = $1;

-- name: DeleteCoachRecord :exec
DELETE FROM Coach WHERE footballer_id = $1;

-- Match CRUD
-- name: CreateMatch :one
INSERT INTO Match (home_team_id, away_team_id, season_id, stadium_id, match_date, attendance, disputed)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id;

-- name: GetMatch :one
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.id = $1;

-- name: ListMatches :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
ORDER BY m.match_date, m.id;

-- name: UpdateMatch :exec
UPDATE Match
SET home_team_id = $2,
    away_team_id = $3,
    season_id = $4,
    stadium_id = $5,
    match_date = $6,
    attendance = $7,
    disputed = $8
WHERE id = $1;

-- name: DeleteMatch :exec
DELETE FROM Match WHERE id = $1;

-- name: ListMatchesByTeam :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.home_team_id = $1 OR m.away_team_id = $1
ORDER BY m.match_date, m.id;

-- name: ListMatchesByDate :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.match_date = $1
ORDER BY m.id;

-- name: ListMatchesByDateAndStadium :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.match_date = $1 AND m.stadium_id = $2
ORDER BY m.id;

-- name: ListMatchesBySeason :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.season_id = $1
ORDER BY m.match_date, m.id;

-- PlayerStats CRUD
-- name: CreatePlayerStat :one
INSERT INTO PlayerStats (
    player_id,
    match_id,
    goals_scored,
    assists,
    shots_on_goal,
    passes_completed,
    interceptions,
    tackles,
    blocks,
    saves,
    goals_conceded
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING id;

-- name: GetPlayerStat :one
SELECT id, player_id, match_id, goals_scored, assists, shots_on_goal, passes_completed, interceptions, tackles, blocks, saves, goals_conceded
FROM PlayerStats
WHERE id = $1;

-- name: ListPlayerStats :many
SELECT id, player_id, match_id, goals_scored, assists, shots_on_goal, passes_completed, interceptions, tackles, blocks, saves, goals_conceded
FROM PlayerStats
ORDER BY id;

-- name: ListPlayerStatsByMatch :many
SELECT id, player_id, match_id, goals_scored, assists, shots_on_goal, passes_completed, interceptions, tackles, blocks, saves, goals_conceded
FROM PlayerStats
WHERE match_id = $1
ORDER BY id;

-- name: UpdatePlayerStat :exec
UPDATE PlayerStats
SET player_id = $2,
    match_id = $3,
    goals_scored = $4,
    assists = $5,
    shots_on_goal = $6,
    passes_completed = $7,
    interceptions = $8,
    tackles = $9,
    blocks = $10,
    saves = $11,
    goals_conceded = $12
WHERE id = $1;

-- name: DeletePlayerStat :exec
DELETE FROM PlayerStats WHERE id = $1;

-- Report 1: standings
-- name: ListStandings :many
SELECT
    t.id AS team_id,
    t.name,
    COALESCE(SUM(
        CASE
            WHEN m.home_team_id = t.id AND COALESCE(hg.total, 0) > COALESCE(ag.total, 0) THEN 3
            WHEN m.away_team_id = t.id AND COALESCE(ag.total, 0) > COALESCE(hg.total, 0) THEN 3
            WHEN COALESCE(hg.total, 0) = COALESCE(ag.total, 0) AND m.id IS NOT NULL THEN 1
            ELSE 0
        END
    ), 0) AS points
FROM Team t
LEFT JOIN Match m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.season_id = $1
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
GROUP BY t.id, t.name
ORDER BY points DESC, t.name;

-- Report 2: matches between teams
-- name: ListMatchesBetweenTeams :many
SELECT
    m.id,
    m.match_date,
    s.name AS stadium_name,
    ht.name AS home_team_name,
    at.name AS away_team_name,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals,
    COALESCE((
        SELECT SUM(ps.assists)
        FROM PlayerStats ps
        JOIN Player p ON p.footballer_id = ps.player_id
        JOIN Footballer f ON f.id = p.footballer_id
        WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
    ), 0) AS home_assists,
    COALESCE((
        SELECT SUM(ps.assists)
        FROM PlayerStats ps
        JOIN Player p ON p.footballer_id = ps.player_id
        JOIN Footballer f ON f.id = p.footballer_id
        WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
    ), 0) AS away_assists
FROM Match m
JOIN Team ht ON m.home_team_id = ht.id
JOIN Team at ON m.away_team_id = at.id
JOIN Stadium s ON m.stadium_id = s.id
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE ((m.home_team_id = $1 AND m.away_team_id = $2) OR (m.home_team_id = $2 AND m.away_team_id = $1))
  AND m.season_id = $3
ORDER BY m.match_date, m.id;

-- name: ListMatchesBetweenTeamsAllSeasons :many
SELECT
    m.id,
    m.match_date,
    s.name AS stadium_name,
    ht.name AS home_team_name,
    at.name AS away_team_name,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals,
    COALESCE((
        SELECT SUM(ps.assists)
        FROM PlayerStats ps
        JOIN Player p ON p.footballer_id = ps.player_id
        JOIN Footballer f ON f.id = p.footballer_id
        WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
    ), 0) AS home_assists,
    COALESCE((
        SELECT SUM(ps.assists)
        FROM PlayerStats ps
        JOIN Player p ON p.footballer_id = ps.player_id
        JOIN Footballer f ON f.id = p.footballer_id
        WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
    ), 0) AS away_assists
FROM Match m
JOIN Team ht ON m.home_team_id = ht.id
JOIN Team at ON m.away_team_id = at.id
JOIN Stadium s ON m.stadium_id = s.id
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE (m.home_team_id = $1 AND m.away_team_id = $2) OR (m.home_team_id = $2 AND m.away_team_id = $1)
ORDER BY m.match_date, m.id;

-- Report 3: matches by date
-- name: ListMatchesForDate :many
SELECT
    m.id,
    m.match_date,
    s.name AS stadium_name,
    ht.name AS home_team_name,
    at.name AS away_team_name,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals,
    m.attendance
FROM Match m
JOIN Team ht ON m.home_team_id = ht.id
JOIN Team at ON m.away_team_id = at.id
JOIN Stadium s ON m.stadium_id = s.id
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.match_date = $1
ORDER BY m.id;

-- name: ListMatchesForDateAndStadium :many
SELECT
    m.id,
    m.match_date,
    s.name AS stadium_name,
    ht.name AS home_team_name,
    at.name AS away_team_name,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals,
    m.attendance
FROM Match m
JOIN Team ht ON m.home_team_id = ht.id
JOIN Team at ON m.away_team_id = at.id
JOIN Stadium s ON m.stadium_id = s.id
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.match_date = $1
  AND m.stadium_id = $2
ORDER BY m.id;

-- Report 4: coaches by experience
-- name: ListCoachesByExperience :many
SELECT
    f.name,
    f.number,
    c.experience_years,
    c.championships_won,
    t.name AS team_name
FROM Footballer f
JOIN Coach c ON c.footballer_id = f.id
LEFT JOIN Team t ON t.id = f.team_id
ORDER BY c.championships_won DESC, c.experience_years DESC, f.name;

-- Report 5: stadiums by attendance
-- name: ListStadiumsByAttendance :many
SELECT
    s.id,
    s.name,
    s.capacity,
    COALESCE(SUM(m.attendance), 0) AS total_attendance,
    COUNT(m.id) AS total_matches,
    CASE
        WHEN COALESCE(s.capacity, 0) > 0 AND COUNT(m.id) > 0
        THEN CAST(ROUND(((COALESCE(SUM(m.attendance), 0)::numeric / (COUNT(m.id) * s.capacity)::numeric) * 100)::numeric, 2) AS FLOAT8)
        ELSE 0.0
    END AS attendance_percentage
FROM Stadium s
LEFT JOIN Match m ON s.id = m.stadium_id AND m.season_id = $1
GROUP BY s.id, s.name, s.capacity
ORDER BY attendance_percentage DESC, s.name;

-- Report 6: team status
-- name: GetTeamStatus :one
WITH match_scores AS (
    SELECT
        m.id,
        m.home_team_id,
        m.away_team_id,
        CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
        CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
    FROM Match m
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
        FROM PlayerStats ps
        JOIN Player p ON p.footballer_id = ps.player_id
        JOIN Footballer f ON f.id = p.footballer_id
        WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
    ) hg ON true
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
        FROM PlayerStats ps
        JOIN Player p ON p.footballer_id = ps.player_id
        JOIN Footballer f ON f.id = p.footballer_id
        WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
    ) ag ON true
    WHERE m.season_id = $2
)
SELECT
    t.id AS team_id,
    t.name,
    COUNT(CASE WHEN ms.home_team_id = t.id AND ms.home_goals > ms.away_goals THEN 1 END) AS home_wins,
    COUNT(CASE WHEN ms.home_team_id = t.id AND ms.home_goals = ms.away_goals THEN 1 END) AS home_draws,
    COUNT(CASE WHEN ms.home_team_id = t.id AND ms.home_goals < ms.away_goals THEN 1 END) AS home_losses,
    COUNT(CASE WHEN ms.away_team_id = t.id AND ms.away_goals > ms.home_goals THEN 1 END) AS away_wins,
    COUNT(CASE WHEN ms.away_team_id = t.id AND ms.away_goals = ms.home_goals THEN 1 END) AS away_draws,
    COUNT(CASE WHEN ms.away_team_id = t.id AND ms.away_goals < ms.home_goals THEN 1 END) AS away_losses,
    COUNT(CASE WHEN (ms.home_team_id = t.id AND ms.home_goals > ms.away_goals) OR (ms.away_team_id = t.id AND ms.away_goals > ms.home_goals) THEN 1 END) AS total_wins,
    COUNT(CASE WHEN ms.home_goals = ms.away_goals AND (ms.home_team_id = t.id OR ms.away_team_id = t.id) THEN 1 END) AS total_draws,
    COUNT(CASE WHEN (ms.home_team_id = t.id AND ms.home_goals < ms.away_goals) OR (ms.away_team_id = t.id AND ms.away_goals < ms.home_goals) THEN 1 END) AS total_losses
FROM Team t
LEFT JOIN match_scores ms ON ms.home_team_id = t.id OR ms.away_team_id = t.id
WHERE t.id = $1
GROUP BY t.id, t.name;

-- Report 7: all-star team (1 portero, 4 defensas, 3 mediocampistas, 3 delanteros)
-- name: GetBestForward :many
SELECT
    'Delantero' AS position,
    f.name AS player_name,
    COALESCE(t.name, '') AS team_name,
    'shots_on_goal' AS metric_name,
    COALESCE(SUM(ps.shots_on_goal), 0) AS metric_value,
    COALESCE(SUM(ps.goals_scored), 0) AS goals_scored,
    COALESCE(SUM(ps.assists), 0) AS assists,
    COALESCE(SUM(ps.shots_on_goal), 0) AS shots_on_goal,
    COALESCE(SUM(ps.passes_completed), 0) AS passes_completed,
    COALESCE(SUM(ps.interceptions), 0) AS interceptions,
    COALESCE(SUM(ps.tackles), 0) AS tackles,
    COALESCE(SUM(ps.blocks), 0) AS blocks,
    COALESCE(SUM(ps.saves), 0) AS saves,
    COALESCE(SUM(ps.goals_conceded), 0) AS goals_conceded
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
JOIN PlayerStats ps ON ps.player_id = p.footballer_id
JOIN Match m ON m.id = ps.match_id
LEFT JOIN Team t ON t.id = f.team_id
WHERE p.position = 'Delantero' AND m.season_id = $1
GROUP BY f.id, f.name, t.name
ORDER BY metric_value DESC, goals_scored DESC, assists DESC, f.name
LIMIT 3;

-- name: GetBestMidfielder :many
SELECT
    'Mediocampo' AS position,
    f.name AS player_name,
    COALESCE(t.name, '') AS team_name,
    'passes_completed_plus_interceptions' AS metric_name,
    COALESCE(SUM(ps.passes_completed + ps.interceptions), 0) AS metric_value,
    COALESCE(SUM(ps.goals_scored), 0) AS goals_scored,
    COALESCE(SUM(ps.assists), 0) AS assists,
    COALESCE(SUM(ps.shots_on_goal), 0) AS shots_on_goal,
    COALESCE(SUM(ps.passes_completed), 0) AS passes_completed,
    COALESCE(SUM(ps.interceptions), 0) AS interceptions,
    COALESCE(SUM(ps.tackles), 0) AS tackles,
    COALESCE(SUM(ps.blocks), 0) AS blocks,
    COALESCE(SUM(ps.saves), 0) AS saves,
    COALESCE(SUM(ps.goals_conceded), 0) AS goals_conceded
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
JOIN PlayerStats ps ON ps.player_id = p.footballer_id
JOIN Match m ON m.id = ps.match_id
LEFT JOIN Team t ON t.id = f.team_id
WHERE p.position = 'Mediocampo' AND m.season_id = $1
GROUP BY f.id, f.name, t.name
ORDER BY metric_value DESC, passes_completed DESC, interceptions DESC, f.name
LIMIT 3;

-- name: GetBestDefender :many
SELECT
    'Defensa' AS position,
    f.name AS player_name,
    COALESCE(t.name, '') AS team_name,
    'tackles_plus_blocks' AS metric_name,
    COALESCE(SUM(ps.tackles + ps.blocks), 0) AS metric_value,
    COALESCE(SUM(ps.goals_scored), 0) AS goals_scored,
    COALESCE(SUM(ps.assists), 0) AS assists,
    COALESCE(SUM(ps.shots_on_goal), 0) AS shots_on_goal,
    COALESCE(SUM(ps.passes_completed), 0) AS passes_completed,
    COALESCE(SUM(ps.interceptions), 0) AS interceptions,
    COALESCE(SUM(ps.tackles), 0) AS tackles,
    COALESCE(SUM(ps.blocks), 0) AS blocks,
    COALESCE(SUM(ps.saves), 0) AS saves,
    COALESCE(SUM(ps.goals_conceded), 0) AS goals_conceded
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
JOIN PlayerStats ps ON ps.player_id = p.footballer_id
JOIN Match m ON m.id = ps.match_id
LEFT JOIN Team t ON t.id = f.team_id
WHERE p.position = 'Defensa' AND m.season_id = $1
GROUP BY f.id, f.name, t.name
ORDER BY metric_value DESC, tackles DESC, blocks DESC, f.name
LIMIT 4;

-- name: GetBestGoalkeeper :one
SELECT
    'Portero' AS position,
    f.name AS player_name,
    COALESCE(t.name, '') AS team_name,
    'saves_minus_goals_conceded' AS metric_name,
    COALESCE(SUM(ps.saves - ps.goals_conceded), 0) AS metric_value,
    COALESCE(SUM(ps.goals_scored), 0) AS goals_scored,
    COALESCE(SUM(ps.assists), 0) AS assists,
    COALESCE(SUM(ps.shots_on_goal), 0) AS shots_on_goal,
    COALESCE(SUM(ps.passes_completed), 0) AS passes_completed,
    COALESCE(SUM(ps.interceptions), 0) AS interceptions,
    COALESCE(SUM(ps.tackles), 0) AS tackles,
    COALESCE(SUM(ps.blocks), 0) AS blocks,
    COALESCE(SUM(ps.saves), 0) AS saves,
    COALESCE(SUM(ps.goals_conceded), 0) AS goals_conceded
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
JOIN PlayerStats ps ON ps.player_id = p.footballer_id
JOIN Match m ON m.id = ps.match_id
LEFT JOIN Team t ON t.id = f.team_id
WHERE p.position = 'Portero' AND m.season_id = $1
GROUP BY f.id, f.name, t.name
ORDER BY metric_value DESC, saves DESC, goals_conceded ASC, f.name
LIMIT 1;

-- Validation queries
-- name: GetFootballersByTeam :many
SELECT id, team_id, name, number, years_in_team
FROM Footballer
WHERE team_id = $1
ORDER BY id;

-- name: GetMatchesByHomeTeam :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.home_team_id = $1
ORDER BY m.match_date, m.id;

-- name: GetMatchesByAwayTeam :many
SELECT
    m.id, m.home_team_id, m.away_team_id, m.season_id, m.stadium_id, m.match_date, m.attendance, m.disputed,
    CAST(COALESCE(hg.total, 0) AS INT) AS home_goals,
    CAST(COALESCE(ag.total, 0) AS INT) AS away_goals
FROM Match m
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.away_team_id
) ag ON true
WHERE m.away_team_id = $1
ORDER BY m.match_date, m.id;
