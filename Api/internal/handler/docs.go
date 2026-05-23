package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

// ServeScalarUI serves the Scalar API documentation UI
func ServeScalarUI(r chi.Router) {
	r.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		html := `
<!DOCTYPE html>
<html>
<head>
  <title>Football API - Scalar Docs</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <script id="api-reference" data-url="/openapi.json"></script>
  <script>
    var script = document.getElementById('api-reference');
    if (script) {
      script.onload = function() {
        // Scalar is loaded
      };
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest"></script>
</body>
</html>
`
		w.Write([]byte(html))
	})

	r.Get("/openapi.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		openAPI := `{
  "openapi": "3.0.0",
  "info": {
    "title": "Football API",
    "description": "REST API for managing football teams, stadiums, seasons, players, matches, player statistics and reports",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:8080",
      "description": "Local server"
    }
  ],
  "tags": [
    { "name": "Teams", "description": "Operations related to football teams" },
    { "name": "Stadiums", "description": "Operations related to stadiums" },
    { "name": "Seasons", "description": "Operations related to seasons" },
    { "name": "Players", "description": "Operations related to players (Footballer + Player tables, atomic creation)" },
    { "name": "Coaches", "description": "Operations related to coaches (Footballer + Coach tables, atomic creation)" },
    { "name": "Matches", "description": "Operations related to matches" },
    { "name": "PlayerStats", "description": "Per-match player statistics" },
    { "name": "Reports", "description": "Analytical and summary reports" }
  ],
  "paths": {
    "/teams": {
      "get": {
        "tags": ["Teams"],
        "summary": "List all teams",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": {
          "200": {
            "description": "List of teams",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Team" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Teams"],
        "summary": "Create a team",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateTeamRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Team created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Team" }
              }
            }
          }
        }
      }
    },
    "/teams/{id}": {
      "get": {
        "tags": ["Teams"],
        "summary": "Get team by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Team details",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Team" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Teams"],
        "summary": "Update team",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateTeamRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Team updated",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Team" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["Teams"],
        "summary": "Delete team",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "204": { "description": "Team deleted" }
        }
      }
    },
    "/stadiums": {
      "get": {
        "tags": ["Stadiums"],
        "summary": "List all stadiums",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": {
          "200": {
            "description": "List of stadiums",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Stadium" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Stadiums"],
        "summary": "Create a stadium",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateStadiumRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Stadium created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Stadium" }
              }
            }
          }
        }
      }
    },
    "/stadiums/{id}": {
      "get": {
        "tags": ["Stadiums"],
        "summary": "Get stadium by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Stadium details",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Stadium" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Stadiums"],
        "summary": "Update stadium",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateStadiumRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Stadium updated",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Stadium" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["Stadiums"],
        "summary": "Delete stadium",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "204": { "description": "Stadium deleted" }
        }
      }
    },
    "/seasons": {
      "get": {
        "tags": ["Seasons"],
        "summary": "List all seasons",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": {
          "200": {
            "description": "List of seasons",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Season" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Seasons"],
        "summary": "Create a season",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateSeasonRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Season created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Season" }
              }
            }
          }
        }
      }
    },
    "/seasons/{id}": {
      "get": {
        "tags": ["Seasons"],
        "summary": "Get season by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Season details",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Season" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Seasons"],
        "summary": "Update season",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateSeasonRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Season updated",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Season" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["Seasons"],
        "summary": "Delete season",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "204": { "description": "Season deleted" }
        }
      }
    },
    "/players": {
      "get": {
        "tags": ["Players"],
        "summary": "List all players",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": {
          "200": {
            "description": "List of players",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Player" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Players"],
        "summary": "Create a player (atomic: Footballer + Player tables)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreatePlayerRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Player created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Player" }
              }
            }
          }
        }
      }
    },
    "/players/{id}": {
      "get": {
        "tags": ["Players"],
        "summary": "Get player by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Player details",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Player" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Players"],
        "summary": "Update player",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreatePlayerRequest" }
            }
          }
        },
        "responses": {
          "204": { "description": "Player updated" }
        }
      },
      "delete": {
        "tags": ["Players"],
        "summary": "Delete player",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "204": { "description": "Player deleted" }
        }
      }
    },
    "/coaches": {
      "get": {
        "tags": ["Coaches"],
        "summary": "List all coaches",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": {
          "200": {
            "description": "List of coaches",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Coach" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Coaches"],
        "summary": "Create a coach (atomic: Footballer + Coach tables)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateCoachRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Coach created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Coach" }
              }
            }
          }
        }
      }
    },
    "/coaches/{id}": {
      "get": {
        "tags": ["Coaches"],
        "summary": "Get coach by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Coach details",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/Coach" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Coaches"],
        "summary": "Update coach",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateCoachRequest" }
            }
          }
        },
        "responses": {
          "204": { "description": "Coach updated" }
        }
      },
      "delete": {
        "tags": ["Coaches"],
        "summary": "Delete coach",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "204": { "description": "Coach deleted" }
        }
      }
    }
    ,
    "/matches": {
      "get": {
        "tags": ["Matches"],
        "summary": "List all matches",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": { "200": { "description": "List of matches", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Match" } } } } } }
      },
      "post": {
        "tags": ["Matches"],
        "summary": "Create a match",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreateMatchRequest" } } } },
        "responses": { "201": { "description": "Match created", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Match" } } } } }
      }
    },
    "/matches/{id}": {
      "get": {
        "tags": ["Matches"],
        "summary": "Get match by ID",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Match details", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Match" } } } } }
      },
      "put": {
        "tags": ["Matches"],
        "summary": "Update match",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } } ],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/UpdateMatchRequest" } } } },
        "responses": { "200": { "description": "Match updated", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Match" } } } } }
      },
      "delete": {
        "tags": ["Matches"],
        "summary": "Delete match",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "204": { "description": "Match deleted" } }
      }
    },
    "/player-stats": {
      "get": {
        "tags": ["PlayerStats"],
        "summary": "List all player stats",
        "parameters": [
          { "name": "limit", "in": "query", "required": false, "schema": { "type": "integer", "default": 20 } },
          { "name": "offset", "in": "query", "required": false, "schema": { "type": "integer", "default": 0 } }
        ],
        "responses": { "200": { "description": "List of player stats", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/PlayerStat" } } } } } }
      },
      "post": {
        "tags": ["PlayerStats"],
        "summary": "Create player stat",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreatePlayerStatRequest" } } } },
        "responses": { "201": { "description": "Player stat created", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PlayerStat" } } } } }
      }
    },
    "/player-stats/{id}": {
      "get": {
        "tags": ["PlayerStats"],
        "summary": "Get player stat by ID",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Player stat details", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PlayerStat" } } } } }
      },
      "put": {
        "tags": ["PlayerStats"],
        "summary": "Update player stat",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } } ],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreatePlayerStatRequest" } } } },
        "responses": { "204": { "description": "Player stat updated" } }
      },
      "delete": {
        "tags": ["PlayerStats"],
        "summary": "Delete player stat",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "204": { "description": "Player stat deleted" } }
      }
    },
    "/reports/standings": {
      "get": {
        "tags": ["Reports"],
        "summary": "Get standings for a season",
        "parameters": [ { "name": "seasonId", "in": "query", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Standings", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/StandingRow" } } } } } }
      }
    },
    "/reports/matches-between-teams": {
      "get": {
        "tags": ["Reports"],
        "summary": "List matches between two teams",
        "parameters": [ { "name": "team1", "in": "query", "required": true, "schema": { "type": "integer" } }, { "name": "team2", "in": "query", "required": true, "schema": { "type": "integer" } }, { "name": "seasonId", "in": "query", "required": false, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Matches between teams", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/MatchBetweenTeamsRow" } } } } } }
      }
    },
    "/reports/matches-by-date": {
      "get": {
        "tags": ["Reports"],
        "summary": "List matches by date (optionally filtered by stadium)",
        "parameters": [ { "name": "date", "in": "query", "required": true, "schema": { "type": "string", "format": "date" } }, { "name": "stadiumId", "in": "query", "required": false, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Matches on date", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/MatchByDateRow" } } } } } }
      }
    },
    "/reports/coaches-by-experience": {
      "get": {
        "tags": ["Reports"],
        "summary": "List coaches ordered by experience",
        "responses": { "200": { "description": "Coaches report", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/CoachReportRow" } } } } } }
      }
    },
    "/reports/stadiums-by-attendance": {
      "get": {
        "tags": ["Reports"],
        "summary": "List stadiums ordered by attendance for a season",
        "parameters": [ { "name": "seasonId", "in": "query", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Stadium attendance report", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/StadiumAttendanceRow" } } } } } }
      }
    },
    "/reports/team-status/{teamId}": {
      "get": {
        "tags": ["Reports"],
        "summary": "Get team status for a season",
        "parameters": [ { "name": "teamId", "in": "path", "required": true, "schema": { "type": "integer" } }, { "name": "seasonId", "in": "query", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "Team status", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/TeamStatusRow" } } } } }
      }
    },
    "/reports/all-star-team": {
      "get": {
        "tags": ["Reports"],
        "summary": "Get all-star team for a season",
        "parameters": [ { "name": "seasonId", "in": "query", "required": true, "schema": { "type": "integer" } } ],
        "responses": { "200": { "description": "All-star team", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/AllStarRow" } } } } } }
      }
    }
  },
  "components": {
    "schemas": {
      "Team": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "province": { "type": "string" },
          "mascot": { "type": "string" },
          "color": { "type": "string" },
          "championships_played": { "type": "integer" },
          "championships_won": { "type": "integer" }
        }
      },
      "CreateTeamRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "province": { "type": "string" },
          "mascot": { "type": "string" },
          "color": { "type": "string" },
          "championships_played": { "type": "integer" },
          "championships_won": { "type": "integer" }
        }
      },
      "UpdateTeamRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "province": { "type": "string" },
          "mascot": { "type": "string" },
          "color": { "type": "string" },
          "championships_played": { "type": "integer" },
          "championships_won": { "type": "integer" }
        }
      },
      "Stadium": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "capacity": { "type": "integer" }
        }
      },
      "CreateStadiumRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "capacity": { "type": "integer" }
        }
      },
      "UpdateStadiumRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "capacity": { "type": "integer" }
        }
      },
      "Season": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "start_date": { "type": "string", "format": "date" },
          "end_date": { "type": "string", "format": "date" }
        }
      },
      "CreateSeasonRequest": {
        "type": "object",
        "properties": {
          "start_date": { "type": "string", "format": "date" },
          "end_date": { "type": "string", "format": "date" }
        }
      },
      "UpdateSeasonRequest": {
        "type": "object",
        "properties": {
          "start_date": { "type": "string", "format": "date" },
          "end_date": { "type": "string", "format": "date" }
        }
      },
      "Player": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "team_id": { "type": "integer" },
          "name": { "type": "string" },
          "number": { "type": "integer" },
          "years_in_team": { "type": "integer" },
          "position": { "type": "string" },
          "matches_played": { "type": "integer" },
          "average_goals_per_match": { "type": "number", "format": "float" }
        }
      },
      "CreatePlayerRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "team_id": { "type": "integer" },
          "name": { "type": "string" },
          "number": { "type": "integer" },
          "years_in_team": { "type": "integer" },
          "position": { "type": "string" },
          "matches_played": { "type": "integer" },
          "average_goals_per_match": { "type": "number", "format": "float" }
        }
      },
      "Coach": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "team_id": { "type": "integer" },
          "name": { "type": "string" },
          "number": { "type": "integer" },
          "years_in_team": { "type": "integer" },
          "experience_years": { "type": "integer" },
          "championships_won": { "type": "integer" }
        }
      },
      "CreateCoachRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "team_id": { "type": "integer" },
          "name": { "type": "string" },
          "number": { "type": "integer" },
          "years_in_team": { "type": "integer" },
          "experience_years": { "type": "integer" },
          "championships_won": { "type": "integer" }
        }
      }
      ,
      "Match": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "home_team_id": { "type": "integer" },
          "away_team_id": { "type": "integer" },
          "season_id": { "type": "integer" },
          "stadium_id": { "type": "integer" },
          "match_date": { "type": "string", "format": "date" },
          "home_goals": { "type": "integer" },
          "away_goals": { "type": "integer" },
          "attendance": { "type": "integer" }
        }
      },
      "CreateMatchRequest": {
        "type": "object",
        "required": ["home_team_id","away_team_id","season_id","match_date"],
        "properties": {
          "home_team_id": { "type": "integer" },
          "away_team_id": { "type": "integer" },
          "season_id": { "type": "integer" },
          "stadium_id": { "type": "integer" },
          "match_date": { "type": "string", "format": "date" },
          "home_goals": { "type": "integer" },
          "away_goals": { "type": "integer" },
          "attendance": { "type": "integer" }
        }
      },
      "UpdateMatchRequest": { "$ref": "#/components/schemas/CreateMatchRequest" },
      "PlayerStat": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "player_id": { "type": "integer" },
          "match_id": { "type": "integer" },
          "goals_scored": { "type": "integer" },
          "assists": { "type": "integer" },
          "shots_on_goal": { "type": "integer" },
          "passes_completed": { "type": "integer" },
          "interceptions": { "type": "integer" },
          "tackles": { "type": "integer" },
          "blocks": { "type": "integer" },
          "saves": { "type": "integer" },
          "goals_conceded": { "type": "integer" }
        }
      },
      "CreatePlayerStatRequest": {
        "type": "object",
        "required": ["player_id","match_id"],
        "properties": {
          "player_id": { "type": "integer" },
          "match_id": { "type": "integer" },
          "goals_scored": { "type": "integer" },
          "assists": { "type": "integer" },
          "shots_on_goal": { "type": "integer" },
          "passes_completed": { "type": "integer" },
          "interceptions": { "type": "integer" },
          "tackles": { "type": "integer" },
          "blocks": { "type": "integer" },
          "saves": { "type": "integer" },
          "goals_conceded": { "type": "integer" }
        }
      },
      "StandingRow": {
        "type": "object",
        "properties": { "team_id": { "type": "integer" }, "name": { "type": "string" }, "points": { "type": "integer" } }
      },
      "MatchBetweenTeamsRow": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "match_date": { "type": "string", "format": "date" },
          "stadium_name": { "type": "string" },
          "home_team_name": { "type": "string" },
          "away_team_name": { "type": "string" },
          "home_goals": { "type": "integer" },
          "away_goals": { "type": "integer" },
          "home_assists": { "type": "integer" },
          "away_assists": { "type": "integer" }
        }
      },
      "MatchByDateRow": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "match_date": { "type": "string", "format": "date" },
          "stadium_name": { "type": "string" },
          "home_team_name": { "type": "string" },
          "away_team_name": { "type": "string" },
          "home_goals": { "type": "integer" },
          "away_goals": { "type": "integer" },
          "attendance": { "type": "integer" }
        }
      },
      "CoachReportRow": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "number": { "type": "integer" },
          "experience_years": { "type": "integer" },
          "championships_won": { "type": "integer" },
          "team_name": { "type": "string" }
        }
      },
      "StadiumAttendanceRow": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "capacity": { "type": "integer" },
          "total_attendance": { "type": "integer" },
          "total_matches": { "type": "integer" },
          "attendance_percentage": { "type": "number", "format": "float" }
        }
      },
      "TeamStatusRow": {
        "type": "object",
        "properties": {
          "team_id": { "type": "integer" },
          "name": { "type": "string" },
          "home_wins": { "type": "integer" },
          "home_draws": { "type": "integer" },
          "home_losses": { "type": "integer" },
          "away_wins": { "type": "integer" },
          "away_draws": { "type": "integer" },
          "away_losses": { "type": "integer" },
          "total_wins": { "type": "integer" },
          "total_draws": { "type": "integer" },
          "total_losses": { "type": "integer" }
        }
      },
      "AllStarRow": {
        "type": "object",
        "properties": {
          "position": { "type": "string" },
          "player_name": { "type": "string" },
          "team_name": { "type": "string" },
          "metric_name": { "type": "string" },
          "metric_value": { "type": "integer" },
          "goals_scored": { "type": "integer" },
          "assists": { "type": "integer" },
          "shots_on_goal": { "type": "integer" },
          "passes_completed": { "type": "integer" },
          "interceptions": { "type": "integer" },
          "tackles": { "type": "integer" },
          "blocks": { "type": "integer" },
          "saves": { "type": "integer" },
          "goals_conceded": { "type": "integer" }
        }
      }
    }
  }
}`
		w.Write([]byte(openAPI))
	})
}
