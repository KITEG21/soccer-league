CREATE TABLE IF NOT EXISTS Team (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT,
    mascot TEXT,
    color TEXT,
    championships_played INT,
    championships_won INT
);

CREATE TABLE IF NOT EXISTS Stadium (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INT
);

CREATE TABLE IF NOT EXISTS Season (
    id BIGSERIAL PRIMARY KEY,
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS Futbolista (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT REFERENCES Team(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    number INT,
    years_in_team INT
);

CREATE TABLE IF NOT EXISTS Position (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Player (
    futbolista_id BIGINT PRIMARY KEY REFERENCES Futbolista(id) ON DELETE CASCADE,
    position_id BIGINT REFERENCES Position(id),
    matches_played INT,
    goals INT,
    assists INT
);

CREATE TABLE IF NOT EXISTS Coach (
    futbolista_id BIGINT PRIMARY KEY REFERENCES Futbolista(id) ON DELETE CASCADE,
    experience_years INT
);
