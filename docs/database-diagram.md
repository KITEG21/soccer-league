# Diagrama de base de datos - Soccer League

Diagrama entidad-relación generado a partir de [schema.sql](./schema.sql). Pega el bloque
en [mermaid.live](https://mermaid.live) para exportarlo como imagen (PNG/SVG) y exponerlo,
o ábrelo directamente en GitHub/VS Code (con la extensión Mermaid), que lo renderizan en el README.

```mermaid
erDiagram
    TEAM {
        bigint id PK
        text name
        text province
        text mascot
        text color
        int championships_played
        int championships_won
    }

    STADIUM {
        bigint id PK
        text name
        int capacity
    }

    SEASON {
        bigint id PK
        date start_date
        date end_date
    }

    FOOTBALLER {
        bigint id PK
        bigint team_id FK
        text name
        int number
        int years_in_team
    }

    PLAYER {
        bigint footballer_id PK
        text position
    }

    COACH {
        bigint footballer_id PK
        int experience_years
        int championships_won
    }

    MATCH {
        bigint id PK
        bigint home_team_id FK
        bigint away_team_id FK
        bigint season_id FK
        bigint stadium_id FK
        date match_date
        int attendance
        boolean disputed
    }

    PLAYERSTATS {
        bigint id PK
        bigint player_id FK
        bigint match_id FK
        int goals_scored
        int assists
        int shots_on_goal
        int passes_completed
        int interceptions
        int tackles
        int blocks
        int saves
        int goals_conceded
    }

    TEAM ||--o{ FOOTBALLER : "tiene"
    FOOTBALLER ||--o| PLAYER : "es un"
    FOOTBALLER ||--o| COACH : "es un"
    TEAM ||--o{ MATCH : "juega de local"
    TEAM ||--o{ MATCH : "juega de visitante"
    SEASON ||--o{ MATCH : "incluye"
    STADIUM ||--o{ MATCH : "alberga"
    PLAYER ||--o{ PLAYERSTATS : "registra"
    MATCH ||--o{ PLAYERSTATS : "registra"
```

## Notas del modelo

- `Footballer` es la tabla base compartida; `Player` y `Coach` son especializaciones 1-a-1
  (su clave primaria es también FK a `Footballer`), por eso una persona es jugador **o**
  entrenador según en qué subtabla tenga fila.
- `Match` tiene dos relaciones independientes con `Team` (local y visitante).
- Los goles del partido ya no se guardan en `Match`; se calculan a partir de la suma de
  `goals_scored` en `PlayerStats` (ver migración `000005_match_disputed_and_goals_from_stats`).
- Triggers en BD impiden registrar `PlayerStats` de partidos no disputados, cambiar un
  partido disputado a no disputado si ya tiene estadísticas, y borrar partidos con
  estadísticas asociadas.
