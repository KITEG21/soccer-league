CREATE TABLE IF NOT EXISTS Team (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    province TEXT,
    mascot TEXT,
    color TEXT,
    championships_played INT,
    championships_won INT
);

CREATE TABLE IF NOT EXISTS Stadium (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    capacity INT
);

CREATE TABLE IF NOT EXISTS Season (
    id BIGSERIAL PRIMARY KEY,
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS Footballer (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT REFERENCES Team(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    number INT,
    years_in_team INT
);

CREATE TABLE IF NOT EXISTS Player (
    footballer_id BIGINT PRIMARY KEY REFERENCES Footballer(id) ON DELETE CASCADE,
    position TEXT NOT NULL,
    matches_played INT,
    average_goals_per_match DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Coach (
    footballer_id BIGINT PRIMARY KEY REFERENCES Footballer(id) ON DELETE CASCADE,
    experience_years INT,
    championships_won INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Match (
    id BIGSERIAL PRIMARY KEY,
    home_team_id BIGINT REFERENCES Team(id) ON DELETE RESTRICT,
    away_team_id BIGINT REFERENCES Team(id) ON DELETE RESTRICT,
    season_id BIGINT REFERENCES Season(id) ON DELETE RESTRICT,
    stadium_id BIGINT REFERENCES Stadium(id) ON DELETE RESTRICT,
    match_date DATE NOT NULL,
    home_goals INT DEFAULT 0,
    away_goals INT DEFAULT 0,
    attendance INT DEFAULT 0
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
