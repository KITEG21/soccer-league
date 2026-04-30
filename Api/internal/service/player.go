package service

import (
	"context"
	"database/sql"

	"github.com/football-api/internal/store"
)

type PlayerService struct {
	store *store.Queries
}

func NewPlayerService(s *store.Queries) *PlayerService {
	return &PlayerService{store: s}
}

type Player struct {
	ID            int64  `json:"id"`
	TeamID        int64  `json:"team_id"`
	Name          string `json:"name"`
	Number        int32  `json:"number"`
	YearsInTeam   int32  `json:"years_in_team"`
	PositionID    int64  `json:"position_id"`
	MatchesPlayed int32  `json:"matches_played"`
	Goals         int32  `json:"goals"`
	Assists       int32  `json:"assists"`
}

type Coach struct {
	ID              int64  `json:"id"`
	TeamID          int64  `json:"team_id"`
	Name            string `json:"name"`
	Number          int32  `json:"number"`
	YearsInTeam     int32  `json:"years_in_team"`
	ExperienceYears int32  `json:"experience_years"`
}

type CreatePlayerRequest struct {
	TeamID        int64  `json:"team_id"`
	Name          string `json:"name" validate:"required"`
	Number        int32  `json:"number"`
	YearsInTeam   int32  `json:"years_in_team"`
	PositionID    int64  `json:"position_id"`
	MatchesPlayed int32  `json:"matches_played"`
	Goals         int32  `json:"goals"`
	Assists       int32  `json:"assists"`
}

type CreateCoachRequest struct {
	TeamID          int64  `json:"team_id"`
	Name            string `json:"name" validate:"required"`
	Number          int32  `json:"number"`
	YearsInTeam     int32  `json:"years_in_team"`
	ExperienceYears int32  `json:"experience_years"`
}

// Helper functions to convert sql.Null types to regular types
func nullInt64ToInt64(n sql.NullInt64) int64 {
	if n.Valid {
		return n.Int64
	}
	return 0
}

func nullInt32ToInt32(n sql.NullInt32) int32 {
	if n.Valid {
		return n.Int32
	}
	return 0
}

func int64ToNullInt64(n int64) sql.NullInt64 {
	return sql.NullInt64{Int64: n, Valid: true}
}

func int32ToNullInt32(n int32) sql.NullInt32 {
	return sql.NullInt32{Int32: n, Valid: true}
}

// Player methods
func (s *PlayerService) CreatePlayer(ctx context.Context, req CreatePlayerRequest) (int64, error) {
	return s.store.CreatePlayer(ctx, store.CreatePlayerParams{
		TeamID:        int64ToNullInt64(req.TeamID),
		Name:          req.Name,
		Number:        int32ToNullInt32(req.Number),
		YearsInTeam:   int32ToNullInt32(req.YearsInTeam),
		PositionID:    int64ToNullInt64(req.PositionID),
		MatchesPlayed: int32ToNullInt32(req.MatchesPlayed),
		Goals:         int32ToNullInt32(req.Goals),
		Assists:       int32ToNullInt32(req.Assists),
	})
}

func (s *PlayerService) GetPlayer(ctx context.Context, id int64) (*Player, error) {
	row, err := s.store.GetPlayer(ctx, id)
	if err != nil {
		return nil, err
	}
	return &Player{
		ID:            row.ID,
		TeamID:        nullInt64ToInt64(row.TeamID),
		Name:          row.Name,
		Number:        nullInt32ToInt32(row.Number),
		YearsInTeam:   nullInt32ToInt32(row.YearsInTeam),
		PositionID:    nullInt64ToInt64(row.PositionID),
		MatchesPlayed: nullInt32ToInt32(row.MatchesPlayed),
		Goals:         nullInt32ToInt32(row.Goals),
		Assists:       nullInt32ToInt32(row.Assists),
	}, nil
}

func (s *PlayerService) ListPlayers(ctx context.Context) ([]*Player, error) {
	rows, err := s.store.ListPlayers(ctx)
	if err != nil {
		return nil, err
	}
	var players []*Player
	for _, row := range rows {
		players = append(players, &Player{
			ID:            row.ID,
			TeamID:        nullInt64ToInt64(row.TeamID),
			Name:          row.Name,
			Number:        nullInt32ToInt32(row.Number),
			YearsInTeam:   nullInt32ToInt32(row.YearsInTeam),
			PositionID:    nullInt64ToInt64(row.PositionID),
			MatchesPlayed: nullInt32ToInt32(row.MatchesPlayed),
			Goals:         nullInt32ToInt32(row.Goals),
			Assists:       nullInt32ToInt32(row.Assists),
		})
	}
	return players, nil
}

func (s *PlayerService) UpdatePlayer(ctx context.Context, id int64, req CreatePlayerRequest) error {
	if err := s.store.UpdatePlayerFutbolista(ctx, store.UpdatePlayerFutbolistaParams{
		ID:          id,
		TeamID:      int64ToNullInt64(req.TeamID),
		Name:        req.Name,
		Number:      int32ToNullInt32(req.Number),
		YearsInTeam: int32ToNullInt32(req.YearsInTeam),
	}); err != nil {
		return err
	}
	return s.store.UpdatePlayerStats(ctx, store.UpdatePlayerStatsParams{
		FutbolistaID:  id,
		PositionID:    int64ToNullInt64(req.PositionID),
		MatchesPlayed: int32ToNullInt32(req.MatchesPlayed),
		Goals:         int32ToNullInt32(req.Goals),
		Assists:       int32ToNullInt32(req.Assists),
	})
}

func (s *PlayerService) DeletePlayer(ctx context.Context, id int64) error {
	if err := s.store.DeletePlayerRecord(ctx, id); err != nil {
		return err
	}
	return s.store.DeleteFutbolista(ctx, id)
}

// Coach methods
func (s *PlayerService) CreateCoach(ctx context.Context, req CreateCoachRequest) (int64, error) {
	return s.store.CreateCoach(ctx, store.CreateCoachParams{
		TeamID:          int64ToNullInt64(req.TeamID),
		Name:            req.Name,
		Number:          int32ToNullInt32(req.Number),
		YearsInTeam:     int32ToNullInt32(req.YearsInTeam),
		ExperienceYears: int32ToNullInt32(req.ExperienceYears),
	})
}

func (s *PlayerService) GetCoach(ctx context.Context, id int64) (*Coach, error) {
	row, err := s.store.GetCoach(ctx, id)
	if err != nil {
		return nil, err
	}
	return &Coach{
		ID:              row.ID,
		TeamID:          nullInt64ToInt64(row.TeamID),
		Name:            row.Name,
		Number:          nullInt32ToInt32(row.Number),
		YearsInTeam:     nullInt32ToInt32(row.YearsInTeam),
		ExperienceYears: nullInt32ToInt32(row.ExperienceYears),
	}, nil
}

func (s *PlayerService) ListCoaches(ctx context.Context) ([]*Coach, error) {
	rows, err := s.store.ListCoaches(ctx)
	if err != nil {
		return nil, err
	}
	var coaches []*Coach
	for _, row := range rows {
		coaches = append(coaches, &Coach{
			ID:              row.ID,
			TeamID:          nullInt64ToInt64(row.TeamID),
			Name:            row.Name,
			Number:          nullInt32ToInt32(row.Number),
			YearsInTeam:     nullInt32ToInt32(row.YearsInTeam),
			ExperienceYears: nullInt32ToInt32ToInt32(row.ExperienceYears),
		})
	}
	return coaches, nil
}

func (s *PlayerService) UpdateCoach(ctx context.Context, id int64, req CreateCoachRequest) error {
	if err := s.store.UpdateCoachFutbolista(ctx, store.UpdateCoachFutbolistaParams{
		ID:          id,
		TeamID:      int64ToNullInt64(req.TeamID),
		Name:        req.Name,
		Number:      int32ToNullInt32(req.Number),
		YearsInTeam: int32ToNullInt32(req.YearsInTeam),
	}); err != nil {
		return err
	}
	return s.store.UpdateCoachExperience(ctx, store.UpdateCoachExperienceParams{
		FutbolistaID:    id,
		ExperienceYears: int32ToNullInt32(req.ExperienceYears),
	})
}

func (s *PlayerService) DeleteCoach(ctx context.Context, id int64) error {
	if err := s.store.DeleteCoachRecord(ctx, id); err != nil {
		return err
	}
	return s.store.DeleteFutbolista(ctx, id)
}

// Helper for nullInt32 to int32 for coach experience years
func nullInt32ToInt32ToInt32(n sql.NullInt32) int32 {
	return nullInt32ToInt32(n)
}
