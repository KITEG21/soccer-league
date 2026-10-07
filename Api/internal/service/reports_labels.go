package service

import (
	"context"
	"fmt"
)

func seasonDateLayout(lang string) string {
	if lang == "en" {
		return "01/02/2006"
	}
	return "02/01/2006"
}

func missingLabel(lang, es, en string, id int64) string {
	prefix := en
	if lang != "en" {
		prefix = es
	}
	return fmt.Sprintf("%s #%d", prefix, id)
}

func (s *ReportsService) TeamLabel(ctx context.Context, id int64, lang string) string {
	team, err := s.store.GetTeam(ctx, id)
	if err != nil || team.Name == "" {
		return missingLabel(lang, "Equipo", "Team", id)
	}
	return team.Name
}

func (s *ReportsService) StadiumLabel(ctx context.Context, id int64, lang string) string {
	stadium, err := s.store.GetStadium(ctx, id)
	if err != nil {
		return missingLabel(lang, "Estadio", "Stadium", id)
	}
	return stadium.Name
}

func (s *ReportsService) SeasonLabel(ctx context.Context, id int64, lang string) string {
	season, err := s.store.GetSeason(ctx, id)
	if err != nil || !season.StartDate.Valid || !season.EndDate.Valid {
		return missingLabel(lang, "Temporada", "Season", id)
	}
	layout := seasonDateLayout(lang)
	return fmt.Sprintf("%s - %s",
		season.StartDate.Time.Format(layout),
		season.EndDate.Time.Format(layout))
}
