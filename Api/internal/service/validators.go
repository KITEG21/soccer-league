package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/football-api/internal/store"
)

// ValidateSeasonDatesNoOverlap valida que las fechas de una temporada no se solapen con otras
func ValidateSeasonDatesNoOverlap(ctx context.Context, q *store.Queries, startDate, endDate string, excludeID *int64) *DateRangeOverlapError {
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil
	}
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil
	}

	if start.After(end) {
		return NewDateRangeOverlapError(
			"date_range",
			0,
			startDate, endDate,
			startDate, endDate,
		)
	}

	// Obtener todas las temporadas
	allSeasons, err := q.ListSeasons(ctx)
	if err != nil {
		return nil
	}

	for _, season := range allSeasons {
		// Saltar si es la misma temporada que estamos editando
		if excludeID != nil && season.ID == *excludeID {
			continue
		}

		if season.StartDate.Valid && season.EndDate.Valid {
			existingStart := season.StartDate.Time
			existingEnd := season.EndDate.Time

			// Verificar solapamiento: si hay cualquier overlapping de fechas
			if (start.Before(existingEnd) || start.Equal(existingEnd)) &&
				(end.After(existingStart) || end.Equal(existingStart)) {

				return NewDateRangeOverlapError(
					"date_range",
					season.ID,
					existingStart.Format("2006-01-02"),
					existingEnd.Format("2006-01-02"),
					startDate,
					endDate,
				)
			}
		}
	}

	return nil
}

// ValidateCoachExperienceYearsVsTeamYears valida que años de experiencia >= años en el equipo
func ValidateCoachExperienceYearsVsTeamYears(experienceYears, yearsInTeam int32) *ValidationError {
	ve := NewValidationError()
	if experienceYears < yearsInTeam {
		ve.Add(
			"experience_years",
			fmt.Sprintf(
				"experience years (%d) cannot be less than years in team (%d)",
				experienceYears, yearsInTeam,
			),
		)
	}
	if ve.HasErrors() {
		return ve
	}
	return nil
}

// ValidatePlayerDorsalUniqueInTeam valida que el dorsal sea único en el equipo
func ValidatePlayerDorsalUniqueInTeam(ctx context.Context, q *store.Queries, teamID int64, dorsal int32, excludeID *int64) *ValidationError {
	ve := NewValidationError()

	// Obtener todos los futbolistas del equipo
	footballers, err := q.GetFootballersByTeam(ctx, sql.NullInt64{Int64: teamID, Valid: true})
	if err != nil {
		return ve
	}

	for _, f := range footballers {
		// Saltar si es el mismo futbolista que estamos editando
		if excludeID != nil && f.ID == *excludeID {
			continue
		}

		if f.Number.Valid && f.Number.Int32 == dorsal {
			ve.Add(
				"number",
				fmt.Sprintf(
					"jersey number %d is already used in this team by %s",
					dorsal, f.Name,
				),
			)
			break
		}
	}

	if ve.HasErrors() {
		return ve
	}
	return nil
}

// ValidateSeasonCanBeDeleted valida si una temporada puede ser eliminada
func ValidateSeasonCanBeDeleted(ctx context.Context, q *store.Queries, seasonID int64) *EntityInUseError {
	// Contar partidos en la temporada
	matches, err := q.ListMatchesBySeason(ctx, sql.NullInt64{Int64: seasonID, Valid: true})
	if err != nil {
		return nil
	}

	refs := make(map[string]int)
	if len(matches) > 0 {
		refs["match"] = len(matches)
	}

	if len(refs) > 0 {
		return NewEntityInUseError("season", seasonID, refs)
	}

	return nil
}

// ValidateTeamCanBeDeleted valida si un equipo puede ser eliminado
func ValidateTeamCanBeDeleted(ctx context.Context, q *store.Queries, teamID int64) *EntityInUseError {
	refs := make(map[string]int)

	// Contar futbolistas (jugadores y entrenadores)
	footballers, err := q.GetFootballersByTeam(ctx, sql.NullInt64{Int64: teamID, Valid: true})
	if err == nil && len(footballers) > 0 {
		refs["footballer"] = len(footballers)
	}

	// Contar partidos donde el equipo es local o visitante
	homeMatches, _ := q.GetMatchesByHomeTeam(ctx, sql.NullInt64{Int64: teamID, Valid: true})
	awayMatches, _ := q.GetMatchesByAwayTeam(ctx, sql.NullInt64{Int64: teamID, Valid: true})
	totalMatches := len(homeMatches) + len(awayMatches)
	if totalMatches > 0 {
		refs["match"] = totalMatches
	}

	if len(refs) > 0 {
		return NewEntityInUseError("team", teamID, refs)
	}

	return nil
}

// ValidateSeasonDateRangeConsistency valida consistencia de fechas al editar
func ValidateSeasonDateRangeConsistency(ctx context.Context, q *store.Queries, seasonID int64, newStartDate, newEndDate string) *ValidationError {
	ve := NewValidationError()

	newStart, err := time.Parse("2006-01-02", newStartDate)
	if err != nil {
		ve.Add("start_date", "invalid date format, use YYYY-MM-DD")
		return ve
	}

	newEnd, err := time.Parse("2006-01-02", newEndDate)
	if err != nil {
		ve.Add("end_date", "invalid date format, use YYYY-MM-DD")
		return ve
	}

	// Obtener la temporada actual
	season, err := q.GetSeason(ctx, seasonID)
	if err != nil {
		return ve
	}

	if !season.StartDate.Valid || !season.EndDate.Valid {
		return ve
	}

	// Obtener todos los partidos de la temporada
	matches, err := q.ListMatchesBySeason(ctx, sql.NullInt64{Int64: seasonID, Valid: true})
	if err == nil && len(matches) > 0 {
		// Verificar que todos los partidos estén dentro del nuevo rango de fechas
		for _, match := range matches {
			if match.MatchDate.Before(newStart) || match.MatchDate.After(newEnd) {
				ve.Add(
					"date_range",
					fmt.Sprintf(
						"cannot change season dates: match on %s (ID: %d) falls outside new date range",
						match.MatchDate.Format("2006-01-02"), match.ID,
					),
				)
				break
			}
		}
	}

	if ve.HasErrors() {
		return ve
	}
	return nil
}
