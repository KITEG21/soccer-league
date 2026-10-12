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
    years_in_team INT,
    UNIQUE(team_id, number)
);

CREATE TABLE IF NOT EXISTS Player (
    footballer_id BIGINT PRIMARY KEY REFERENCES Footballer(id) ON DELETE CASCADE,
    position TEXT NOT NULL
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
    attendance INT DEFAULT 0,
    disputed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS PlayerStats (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT REFERENCES Player(footballer_id) ON DELETE RESTRICT,
    match_id BIGINT REFERENCES Match(id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES Team(id) ON DELETE RESTRICT,
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

CREATE TABLE IF NOT EXISTS Users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'visitante')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    first_name TEXT NOT NULL DEFAULT '' CHECK (char_length(first_name) <= 100),
    last_name TEXT NOT NULL DEFAULT '' CHECK (char_length(last_name) <= 100)
);

CREATE TABLE IF NOT EXISTS RefreshToken (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    rotated_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
