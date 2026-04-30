package service

import (
	"context"

	"github.com/football-api/internal/store"
)

type SeasonService struct {
	store *store.Queries
}

func NewSeasonService(s *store.Queries) *SeasonService {
	return &SeasonService{store: s}
}

type Season struct {
	ID        int64  `json:"id"`
	StartDate string `json:"start_date,omitempty"`
	EndDate   string `json:"end_date,omitempty"`
}

type CreateSeasonRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

type UpdateSeasonRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

func (s *SeasonService) Create(ctx context.Context, req CreateSeasonRequest) (*Season, error) {
	id, err := s.store.CreateSeason(ctx, store.CreateSeasonParams{
		StartDate: toNullTime(req.StartDate),
		EndDate:   toNullTime(req.EndDate),
	})
	if err != nil {
		return nil, err
	}

	se, err := s.store.GetSeason(ctx, id)
	if err != nil {
		return nil, err
	}

	return &Season{
		ID:        se.ID,
		StartDate: fromNullTime(se.StartDate),
		EndDate:   fromNullTime(se.EndDate),
	}, nil
}

func (s *SeasonService) Get(ctx context.Context, id int64) (*Season, error) {
	se, err := s.store.GetSeason(ctx, id)
	if err != nil {
		return nil, err
	}
	return &Season{
		ID:        se.ID,
		StartDate: fromNullTime(se.StartDate),
		EndDate:   fromNullTime(se.EndDate),
	}, nil
}

func (s *SeasonService) List(ctx context.Context) ([]*Season, error) {
	rows, err := s.store.ListSeasons(ctx)
	if err != nil {
		return nil, err
	}

	var seasons []*Season
	for _, se := range rows {
		seasons = append(seasons, &Season{
			ID:        se.ID,
			StartDate: fromNullTime(se.StartDate),
			EndDate:   fromNullTime(se.EndDate),
		})
	}
	return seasons, nil
}

func (s *SeasonService) Update(ctx context.Context, id int64, req UpdateSeasonRequest) (*Season, error) {
	err := s.store.UpdateSeason(ctx, store.UpdateSeasonParams{
		ID:        id,
		StartDate: toNullTime(req.StartDate),
		EndDate:   toNullTime(req.EndDate),
	})
	if err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

func (s *SeasonService) Delete(ctx context.Context, id int64) error {
	return s.store.DeleteSeason(ctx, id)
}
