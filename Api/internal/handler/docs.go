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
    "description": "REST API for managing football teams, stadiums, seasons, players and coaches",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:8080",
      "description": "Local server"
    }
  ],
  "tags": [
    {
      "name": "Teams",
      "description": "Operations related to football teams"
    },
    {
      "name": "Stadiums",
      "description": "Operations related to stadiums"
    },
    {
      "name": "Seasons",
      "description": "Operations related to seasons"
    },
    {
      "name": "Players",
      "description": "Operations related to players (Futbolista + Player tables, atomic creation)"
    },
    {
      "name": "Coaches",
      "description": "Operations related to coaches (Futbolista + Coach tables, atomic creation)"
    }
  ],
  "paths": {
    "/teams": {
      "get": {
        "tags": ["Teams"],
        "summary": "List all teams",
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
        "summary": "Create a player (atomic: Futbolista + Player tables)",
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
        "summary": "Create a coach (atomic: Futbolista + Coach tables)",
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
          "position_id": { "type": "integer" },
          "matches_played": { "type": "integer" },
          "goals": { "type": "integer" },
          "assists": { "type": "integer" }
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
          "position_id": { "type": "integer" },
          "matches_played": { "type": "integer" },
          "goals": { "type": "integer" },
          "assists": { "type": "integer" }
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
          "experience_years": { "type": "integer" }
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
          "experience_years": { "type": "integer" }
        }
      }
    }
  }
}`
		w.Write([]byte(openAPI))
	})
}
