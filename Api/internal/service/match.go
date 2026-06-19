package service

import (
	"context"
	"fmt"
	"time"

	"github.com/football-api/internal/store"
)

type MatchService struct {
	store *store.Queries
}

func NewMatchService(s *store.Queries) *MatchService {
	return &MatchService{store: s}
}

type Match struct {
	ID         int64  `json:"id"`
	HomeTeamID int64  `json:"home_team_id"`
	AwayTeamID int64  `json:"away_team_id"`
	SeasonID   int64  `json:"season_id"`
	StadiumID  int64  `json:"stadium_id"`
	MatchDate  string `json:"match_date"`
	HomeGoals  int32  `json:"home_goals"`
	AwayGoals  int32  `json:"away_goals"`
	Attendance int32  `json:"attendance"`
	Disputed   bool   `json:"disputed"`
}

type CreateMatchRequest struct {
	HomeTeamID int64  `json:"home_team_id"`
	AwayTeamID int64  `json:"away_team_id"`
	SeasonID   int64  `json:"season_id"`
	StadiumID  int64  `json:"stadium_id"`
	MatchDate  string `json:"match_date"`
	Attendance int32  `json:"attendance"`
	Disputed   bool   `json:"disputed"`
}

type UpdateMatchRequest = CreateMatchRequest

func parseMatchDate(value string) (time.Time, error) {
	if value == "" {
		return time.Time{}, fmt.Errorf("match_date is required")
	}
	return time.Parse("2006-01-02", value)
}

func matchFromStore(row store.GetMatchRow) *Match {
	return &Match{
		ID:         row.ID,
		HomeTeamID: fromNullInt64(row.HomeTeamID),
		AwayTeamID: fromNullInt64(row.AwayTeamID),
		SeasonID:   fromNullInt64(row.SeasonID),
		StadiumID:  fromNullInt64(row.StadiumID),
		MatchDate:  row.MatchDate.Format("2006-01-02"),
		HomeGoals:  row.HomeGoals,
		AwayGoals:  row.AwayGoals,
		Attendance: fromNullInt32(row.Attendance),
		Disputed:   row.Disputed,
	}
}

func (s *MatchService) Create(ctx context.Context, req CreateMatchRequest) (*Match, error) {
	matchDate, err := parseMatchDate(req.MatchDate)
	if err != nil {
		return nil, err
	}

	id, err := s.store.CreateMatch(ctx, store.CreateMatchParams{
		HomeTeamID: int64ToNullInt64(req.HomeTeamID),
		AwayTeamID: int64ToNullInt64(req.AwayTeamID),
		SeasonID:   int64ToNullInt64(req.SeasonID),
		StadiumID:  int64ToNullInt64(req.StadiumID),
		MatchDate:  matchDate,
		Attendance: int32ToNullInt32(req.Attendance),
		Disputed:   req.Disputed,
	})
	if err != nil {
		return nil, err
	}
	row, err := s.store.GetMatch(ctx, id)
	if err != nil {
		return nil, err
	}
	return matchFromStore(row), nil
}

func (s *MatchService) Get(ctx context.Context, id int64) (*Match, error) {
	row, err := s.store.GetMatch(ctx, id)
	if err != nil {
		return nil, err
	}
	return matchFromStore(row), nil
}

func (s *MatchService) List(ctx context.Context, limit, offset int) ([]*Match, int, error) {
	rows, err := s.store.ListMatches(ctx)
	if err != nil {
		return nil, 0, err
	}
	var matches []*Match
	for _, row := range rows {
		matches = append(matches, &Match{
			ID:         row.ID,
			HomeTeamID: fromNullInt64(row.HomeTeamID),
			AwayTeamID: fromNullInt64(row.AwayTeamID),
			SeasonID:   fromNullInt64(row.SeasonID),
			StadiumID:  fromNullInt64(row.StadiumID),
			MatchDate:  row.MatchDate.Format("2006-01-02"),
			HomeGoals:  row.HomeGoals,
			AwayGoals:  row.AwayGoals,
			Attendance: fromNullInt32(row.Attendance),
			Disputed:   row.Disputed,
		})
	}
	page, total := paginateSlice(matches, limit, offset)
	return page, total, nil
}

func (s *MatchService) Update(ctx context.Context, id int64, req UpdateMatchRequest) (*Match, error) {
	matchDate, err := parseMatchDate(req.MatchDate)
	if err != nil {
		return nil, err
	}
	if err := s.store.UpdateMatch(ctx, store.UpdateMatchParams{
		ID:         id,
		HomeTeamID: int64ToNullInt64(req.HomeTeamID),
		AwayTeamID: int64ToNullInt64(req.AwayTeamID),
		SeasonID:   int64ToNullInt64(req.SeasonID),
		StadiumID:  int64ToNullInt64(req.StadiumID),
		MatchDate:  matchDate,
		Attendance: int32ToNullInt32(req.Attendance),
		Disputed:   req.Disputed,
	}); err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

func (s *MatchService) Delete(ctx context.Context, id int64) error {
	if err := ValidateMatchCanBeDeleted(ctx, s.store, id); err != nil {
		return err
	}
	return s.store.DeleteMatch(ctx, id)
}
