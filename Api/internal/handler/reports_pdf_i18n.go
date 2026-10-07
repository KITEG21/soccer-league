package handler

import (
	"net/http"
	"strings"
)

const pdfDefaultLang = "es"

var pdfLangs = map[string]bool{"es": true, "en": true}

var pdfStrings = map[string]map[string]string{
	"es": {
		"subtitle": "Liga Nacional de Fútbol",

		"standings.title":       "Tabla de Posiciones",
		"head_to_head.title":    "Enfrentamientos Directos",
		"matches_by_date.title": "Partidos por Fecha",
		"coaches.title":         "Experiencia de Entrenadores",
		"attendance.title":      "Asistencia a Estadios",
		"team_status.title":     "Estado del Equipo",
		"all_star.title":        "Equipo Ideal de la Temporada",

		"col.date":          "Fecha",
		"col.stadium":       "Estadio",
		"col.home":          "Local",
		"col.away":          "Visitante",
		"col.result":        "Resultado",
		"col.assist_home":   "Asist. Local",
		"col.assist_away":   "Asist. Visitante",
		"col.attendance":    "Asistencia",
		"col.team":          "Equipo",
		"col.points":        "Puntos",
		"col.number":        "Número",
		"col.coach":         "Entrenador",
		"col.years":         "Años de Experiencia",
		"col.championships": "Campeonatos Ganados",
		"col.capacity":      "Capacidad",
		"col.matches":       "Partidos",
		"col.total_att":     "Asistencia Total",
		"col.percentage":    "% Audiencia",
		"col.statistic":     "Estadística",
		"col.total":         "Total",
		"col.position":      "Posición",
		"col.player":        "Jugador",
		"col.metric":        "Métrica Clave",
		"col.value":         "Valor",

		"filter.season":       "Temporada:",
		"filter.date":         "Fecha:",
		"filter.stadium":      "Estadio:",
		"filter.home_team":    "Equipo local:",
		"filter.away_team":    "Equipo visitante:",
		"filter.team":         "Equipo:",
		"filter.all_seasons":  "Todas las temporadas",
		"filter.all_stadiums": "Todos los estadios",

		"stat.wins":     "Victorias",
		"stat.draws":    "Empates",
		"stat.losses":   "Derrotas",
		"coach.no_team": "Sin equipo",

		"metric.shots_on_goal":                       "Tiros a Puerta",
		"metric.passes_completed_plus_interceptions": "Pases + Intercepciones",
		"metric.tackles_plus_blocks":                 "Entradas + Bloqueos",
		"metric.saves_minus_goals_conceded":          "Paradas - Goles Encajados",

		"file.standings":       "tabla-posiciones",
		"file.head_to_head":    "enfrentamientos-directos",
		"file.matches_by_date": "partidos-por-fecha",
		"file.coaches":         "experiencia-entrenadores",
		"file.attendance":      "asistencia-estadios",
		"file.team_status":     "estado-equipo",
		"file.all_star":        "equipo-ideal",
	},
	"en": {
		"subtitle": "National Football League",

		"standings.title":       "Standings",
		"head_to_head.title":    "Head-to-Head",
		"matches_by_date.title": "Matches by Date",
		"coaches.title":         "Coach Experience",
		"attendance.title":      "Stadium Attendance",
		"team_status.title":     "Team Status",
		"all_star.title":        "Team of the Season",

		"col.date":          "Date",
		"col.stadium":       "Stadium",
		"col.home":          "Home",
		"col.away":          "Away",
		"col.result":        "Result",
		"col.assist_home":   "Home Assists",
		"col.assist_away":   "Away Assists",
		"col.attendance":    "Attendance",
		"col.team":          "Team",
		"col.points":        "Points",
		"col.number":        "Number",
		"col.coach":         "Coach",
		"col.years":         "Years of Experience",
		"col.championships": "Championships Won",
		"col.capacity":      "Capacity",
		"col.matches":       "Matches",
		"col.total_att":     "Total Attendance",
		"col.percentage":    "% Attendance",
		"col.statistic":     "Statistic",
		"col.total":         "Total",
		"col.position":      "Position",
		"col.player":        "Player",
		"col.metric":        "Key Metric",
		"col.value":         "Value",

		"filter.season":       "Season:",
		"filter.date":         "Date:",
		"filter.stadium":      "Stadium:",
		"filter.home_team":    "Home team:",
		"filter.away_team":    "Away team:",
		"filter.team":         "Team:",
		"filter.all_seasons":  "All seasons",
		"filter.all_stadiums": "All stadiums",

		"stat.wins":     "Wins",
		"stat.draws":    "Draws",
		"stat.losses":   "Losses",
		"coach.no_team": "No team",

		"metric.shots_on_goal":                       "Shots on Goal",
		"metric.passes_completed_plus_interceptions": "Passes + Interceptions",
		"metric.tackles_plus_blocks":                 "Tackles + Blocks",
		"metric.saves_minus_goals_conceded":          "Saves - Goals Conceded",

		"file.standings":       "standings",
		"file.head_to_head":    "head-to-head",
		"file.matches_by_date": "matches-by-date",
		"file.coaches":         "coach-experience",
		"file.attendance":      "stadium-attendance",
		"file.team_status":     "team-status",
		"file.all_star":        "team-of-the-season",
	},
}

var pdfPositionsEN = map[string]string{
	"Portero":    "Goalkeeper",
	"Defensa":    "Defender",
	"Mediocampo": "Midfielder",
	"Delantero":  "Forward",
}

func pdfPositionLabel(lang, position string) string {
	if lang == "en" {
		if translated, ok := pdfPositionsEN[position]; ok {
			return translated
		}
	}
	return position
}

func pdfLang(r *http.Request) string {
	if lang := r.URL.Query().Get("lang"); lang != "" {
		if pdfLangs[lang] {
			return lang
		}
		return pdfDefaultLang
	}

	for _, part := range strings.Split(r.Header.Get("Accept-Language"), ",") {
		tag := strings.ToLower(strings.TrimSpace(strings.SplitN(part, ";", 2)[0]))
		if pdfLangs[tag] {
			return tag
		}
		if strings.HasPrefix(tag, "en") {
			return "en"
		}
		if strings.HasPrefix(tag, "es") {
			return "es"
		}
	}
	return pdfDefaultLang
}

func pt(lang, key string) string {
	if values, ok := pdfStrings[lang]; ok {
		if value, ok := values[key]; ok {
			return value
		}
	}
	if value, ok := pdfStrings["es"][key]; ok {
		return value
	}
	return key
}
