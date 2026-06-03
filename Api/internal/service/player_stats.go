package service

import (
	"context"

	"github.com/football-api/internal/store"
)

type PlayerStatsService struct {
	store *store.Queries
}

func NewPlayerStatsService(s *store.Queries) *PlayerStatsService {
	return &PlayerStatsService{store: s}
}

type PlayerStat struct {
	ID              int64 `json:"id"`
	PlayerID        int64 `json:"player_id"`
	MatchID         int64 `json:"match_id"`
	GoalsScored     int32 `json:"goals_scored"`
	Assists         int32 `json:"assists"`
	ShotsOnGoal     int32 `json:"shots_on_goal"`
	PassesCompleted int32 `json:"passes_completed"`
	Interceptions   int32 `json:"interceptions"`
	Tackles         int32 `json:"tackles"`
	Blocks          int32 `json:"blocks"`
	Saves           int32 `json:"saves"`
	GoalsConceded   int32 `json:"goals_conceded"`
}

type CreatePlayerStatRequest struct {
	PlayerID        int64 `json:"player_id"`
	MatchID         int64 `json:"match_id"`
	GoalsScored     int32 `json:"goals_scored"`
	Assists         int32 `json:"assists"`
	ShotsOnGoal     int32 `json:"shots_on_goal"`
	PassesCompleted int32 `json:"passes_completed"`
	Interceptions   int32 `json:"interceptions"`
	Tackles         int32 `json:"tackles"`
	Blocks          int32 `json:"blocks"`
	Saves           int32 `json:"saves"`
	GoalsConceded   int32 `json:"goals_conceded"`
}

type UpdatePlayerStatRequest = CreatePlayerStatRequest

func playerStatFromStore(row store.Playerstat) *PlayerStat {
	return &PlayerStat{
		ID:              row.ID,
		PlayerID:        fromNullInt64(row.PlayerID),
		MatchID:         fromNullInt64(row.MatchID),
		GoalsScored:     fromNullInt32(row.GoalsScored),
		Assists:         fromNullInt32(row.Assists),
		ShotsOnGoal:     fromNullInt32(row.ShotsOnGoal),
		PassesCompleted: fromNullInt32(row.PassesCompleted),
		Interceptions:   fromNullInt32(row.Interceptions),
		Tackles:         fromNullInt32(row.Tackles),
		Blocks:          fromNullInt32(row.Blocks),
		Saves:           fromNullInt32(row.Saves),
		GoalsConceded:   fromNullInt32(row.GoalsConceded),
	}
}

func (s *PlayerStatsService) Create(ctx context.Context, req CreatePlayerStatRequest) (*PlayerStat, error) {
	if ve := ValidateMatchDisputed(ctx, s.store, req.MatchID); ve != nil {
		return nil, ve
	}
	id, err := s.store.CreatePlayerStat(ctx, store.CreatePlayerStatParams{
		PlayerID:        int64ToNullInt64(req.PlayerID),
		MatchID:         int64ToNullInt64(req.MatchID),
		GoalsScored:     int32ToNullInt32(req.GoalsScored),
		Assists:         int32ToNullInt32(req.Assists),
		ShotsOnGoal:     int32ToNullInt32(req.ShotsOnGoal),
		PassesCompleted: int32ToNullInt32(req.PassesCompleted),
		Interceptions:   int32ToNullInt32(req.Interceptions),
		Tackles:         int32ToNullInt32(req.Tackles),
		Blocks:          int32ToNullInt32(req.Blocks),
		Saves:           int32ToNullInt32(req.Saves),
		GoalsConceded:   int32ToNullInt32(req.GoalsConceded),
	})
	if err != nil {
		return nil, err
	}
	row, err := s.store.GetPlayerStat(ctx, id)
	if err != nil {
		return nil, err
	}
	return playerStatFromStore(row), nil
}

func (s *PlayerStatsService) Get(ctx context.Context, id int64) (*PlayerStat, error) {
	row, err := s.store.GetPlayerStat(ctx, id)
	if err != nil {
		return nil, err
	}
	return playerStatFromStore(row), nil
}

func (s *PlayerStatsService) List(ctx context.Context, limit, offset int) ([]*PlayerStat, error) {
	rows, err := s.store.ListPlayerStats(ctx)
	if err != nil {
		return nil, err
	}
	var stats []*PlayerStat
	for _, row := range rows {
		stats = append(stats, playerStatFromStore(row))
	}
	return paginateSlice(stats, limit, offset), nil
}

func (s *PlayerStatsService) Update(ctx context.Context, id int64, req UpdatePlayerStatRequest) error {
	if ve := ValidateMatchDisputed(ctx, s.store, req.MatchID); ve != nil {
		return ve
	}
	return s.store.UpdatePlayerStat(ctx, store.UpdatePlayerStatParams{
		ID:              id,
		PlayerID:        int64ToNullInt64(req.PlayerID),
		MatchID:         int64ToNullInt64(req.MatchID),
		GoalsScored:     int32ToNullInt32(req.GoalsScored),
		Assists:         int32ToNullInt32(req.Assists),
		ShotsOnGoal:     int32ToNullInt32(req.ShotsOnGoal),
		PassesCompleted: int32ToNullInt32(req.PassesCompleted),
		Interceptions:   int32ToNullInt32(req.Interceptions),
		Tackles:         int32ToNullInt32(req.Tackles),
		Blocks:          int32ToNullInt32(req.Blocks),
		Saves:           int32ToNullInt32(req.Saves),
		GoalsConceded:   int32ToNullInt32(req.GoalsConceded),
	})
}

func (s *PlayerStatsService) Delete(ctx context.Context, id int64) error {
	return s.store.DeletePlayerStat(ctx, id)
}
