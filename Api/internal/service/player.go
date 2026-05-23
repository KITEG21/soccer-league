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
	ID                   int64   `json:"id"`
	TeamID               int64   `json:"team_id"`
	Name                 string  `json:"name"`
	Number               int32   `json:"number"`
	YearsInTeam          int32   `json:"years_in_team"`
	Position             string  `json:"position"`
	MatchesPlayed        int32   `json:"matches_played"`
	AverageGoalsPerMatch float64 `json:"average_goals_per_match"`
}

type Coach struct {
	ID               int64  `json:"id"`
	TeamID           int64  `json:"team_id"`
	Name             string `json:"name"`
	Number           int32  `json:"number"`
	YearsInTeam      int32  `json:"years_in_team"`
	ExperienceYears  int32  `json:"experience_years"`
	ChampionshipsWon int32  `json:"championships_won"`
}

type CreatePlayerRequest struct {
	TeamID               int64   `json:"team_id"`
	Name                 string  `json:"name" validate:"required"`
	Number               int32   `json:"number"`
	YearsInTeam          int32   `json:"years_in_team"`
	Position             string  `json:"position"`
	MatchesPlayed        int32   `json:"matches_played"`
	AverageGoalsPerMatch float64 `json:"average_goals_per_match"`
}

type CreateCoachRequest struct {
	TeamID           int64  `json:"team_id"`
	Name             string `json:"name" validate:"required"`
	Number           int32  `json:"number"`
	YearsInTeam      int32  `json:"years_in_team"`
	ExperienceYears  int32  `json:"experience_years"`
	ChampionshipsWon int32  `json:"championships_won"`
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

func nullFloat64ToFloat64(n sql.NullFloat64) float64 {
	if n.Valid {
		return n.Float64
	}
	return 0
}

func int64ToNullInt64(n int64) sql.NullInt64 {
	return sql.NullInt64{Int64: n, Valid: true}
}

func int32ToNullInt32(n int32) sql.NullInt32 {
	return sql.NullInt32{Int32: n, Valid: true}
}

func float64ToNullFloat64(n float64) sql.NullFloat64 {
	return sql.NullFloat64{Float64: n, Valid: true}
}

// Player methods
func (s *PlayerService) CreatePlayer(ctx context.Context, req CreatePlayerRequest) (int64, error) {
	return s.store.CreatePlayer(ctx, store.CreatePlayerParams{
		TeamID:               int64ToNullInt64(req.TeamID),
		Name:                 req.Name,
		Number:               int32ToNullInt32(req.Number),
		YearsInTeam:          int32ToNullInt32(req.YearsInTeam),
		Position:             req.Position,
		MatchesPlayed:        int32ToNullInt32(req.MatchesPlayed),
		AverageGoalsPerMatch: float64ToNullFloat64(req.AverageGoalsPerMatch),
	})
}

func (s *PlayerService) GetPlayer(ctx context.Context, id int64) (*Player, error) {
	row, err := s.store.GetPlayer(ctx, id)
	if err != nil {
		return nil, err
	}
	return &Player{
		ID:                   row.ID,
		TeamID:               nullInt64ToInt64(row.TeamID),
		Name:                 row.Name,
		Number:               nullInt32ToInt32(row.Number),
		YearsInTeam:          nullInt32ToInt32(row.YearsInTeam),
		Position:             row.Position,
		MatchesPlayed:        nullInt32ToInt32(row.MatchesPlayed),
		AverageGoalsPerMatch: nullFloat64ToFloat64(row.AverageGoalsPerMatch),
	}, nil
}

func (s *PlayerService) ListPlayers(ctx context.Context, limit, offset int) ([]*Player, error) {
	rows, err := s.store.ListPlayers(ctx)
	if err != nil {
		return nil, err
	}
	var players []*Player
	for _, row := range rows {
		players = append(players, &Player{
			ID:                   row.ID,
			TeamID:               nullInt64ToInt64(row.TeamID),
			Name:                 row.Name,
			Number:               nullInt32ToInt32(row.Number),
			YearsInTeam:          nullInt32ToInt32(row.YearsInTeam),
			Position:             row.Position,
			MatchesPlayed:        nullInt32ToInt32(row.MatchesPlayed),
			AverageGoalsPerMatch: nullFloat64ToFloat64(row.AverageGoalsPerMatch),
		})
	}
	return paginateSlice(players, limit, offset), nil
}

func (s *PlayerService) UpdatePlayer(ctx context.Context, id int64, req CreatePlayerRequest) error {
	if err := s.store.UpdatePlayerFootballer(ctx, store.UpdatePlayerFootballerParams{
		ID:          id,
		TeamID:      int64ToNullInt64(req.TeamID),
		Name:        req.Name,
		Number:      int32ToNullInt32(req.Number),
		YearsInTeam: int32ToNullInt32(req.YearsInTeam),
	}); err != nil {
		return err
	}
	return s.store.UpdatePlayerDetails(ctx, store.UpdatePlayerDetailsParams{
		FootballerID:         id,
		Position:             req.Position,
		MatchesPlayed:        int32ToNullInt32(req.MatchesPlayed),
		AverageGoalsPerMatch: float64ToNullFloat64(req.AverageGoalsPerMatch),
	})
}

func (s *PlayerService) DeletePlayer(ctx context.Context, id int64) error {
	if err := s.store.DeletePlayerRecord(ctx, id); err != nil {
		return err
	}
	return s.store.DeleteFootballer(ctx, id)
}

// Coach methods
func (s *PlayerService) CreateCoach(ctx context.Context, req CreateCoachRequest) (int64, error) {
	return s.store.CreateCoach(ctx, store.CreateCoachParams{
		TeamID:           int64ToNullInt64(req.TeamID),
		Name:             req.Name,
		Number:           int32ToNullInt32(req.Number),
		YearsInTeam:      int32ToNullInt32(req.YearsInTeam),
		ExperienceYears:  int32ToNullInt32(req.ExperienceYears),
		ChampionshipsWon: int32ToNullInt32(req.ChampionshipsWon),
	})
}

func (s *PlayerService) GetCoach(ctx context.Context, id int64) (*Coach, error) {
	row, err := s.store.GetCoach(ctx, id)
	if err != nil {
		return nil, err
	}
	return &Coach{
		ID:               row.ID,
		TeamID:           nullInt64ToInt64(row.TeamID),
		Name:             row.Name,
		Number:           nullInt32ToInt32(row.Number),
		YearsInTeam:      nullInt32ToInt32(row.YearsInTeam),
		ExperienceYears:  nullInt32ToInt32(row.ExperienceYears),
		ChampionshipsWon: nullInt32ToInt32(row.ChampionshipsWon),
	}, nil
}

func (s *PlayerService) ListCoaches(ctx context.Context, limit, offset int) ([]*Coach, error) {
	rows, err := s.store.ListCoaches(ctx)
	if err != nil {
		return nil, err
	}
	var coaches []*Coach
	for _, row := range rows {
		coaches = append(coaches, &Coach{
			ID:               row.ID,
			TeamID:           nullInt64ToInt64(row.TeamID),
			Name:             row.Name,
			Number:           nullInt32ToInt32(row.Number),
			YearsInTeam:      nullInt32ToInt32(row.YearsInTeam),
			ExperienceYears:  nullInt32ToInt32(row.ExperienceYears),
			ChampionshipsWon: nullInt32ToInt32(row.ChampionshipsWon),
		})
	}
	return paginateSlice(coaches, limit, offset), nil
}

func (s *PlayerService) UpdateCoach(ctx context.Context, id int64, req CreateCoachRequest) error {
	if err := s.store.UpdateCoachFootballer(ctx, store.UpdateCoachFootballerParams{
		ID:          id,
		TeamID:      int64ToNullInt64(req.TeamID),
		Name:        req.Name,
		Number:      int32ToNullInt32(req.Number),
		YearsInTeam: int32ToNullInt32(req.YearsInTeam),
	}); err != nil {
		return err
	}
	return s.store.UpdateCoachDetails(ctx, store.UpdateCoachDetailsParams{
		FootballerID:     id,
		ExperienceYears:  int32ToNullInt32(req.ExperienceYears),
		ChampionshipsWon: int32ToNullInt32(req.ChampionshipsWon),
	})
}

func (s *PlayerService) DeleteCoach(ctx context.Context, id int64) error {
	if err := s.store.DeleteCoachRecord(ctx, id); err != nil {
		return err
	}
	return s.store.DeleteFootballer(ctx, id)
}
