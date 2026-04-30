package service

import (
	"context"

	"github.com/football-api/internal/store"
)

type StadiumService struct {
	store *store.Queries
}

func NewStadiumService(s *store.Queries) *StadiumService {
	return &StadiumService{store: s}
}

type Stadium struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Capacity int32  `json:"capacity,omitempty"`
}

type CreateStadiumRequest struct {
	Name     string `json:"name" validate:"required"`
	Capacity int32  `json:"capacity"`
}

type UpdateStadiumRequest struct {
	Name     string `json:"name" validate:"required"`
	Capacity int32  `json:"capacity"`
}

func (s *StadiumService) Create(ctx context.Context, req CreateStadiumRequest) (*Stadium, error) {
	id, err := s.store.CreateStadium(ctx, store.CreateStadiumParams{
		Name:     req.Name,
		Capacity: toNullInt32(req.Capacity),
	})
	if err != nil {
		return nil, err
	}

	st, err := s.store.GetStadium(ctx, id)
	if err != nil {
		return nil, err
	}

	return &Stadium{
		ID:       st.ID,
		Name:     st.Name,
		Capacity: fromNullInt32(st.Capacity),
	}, nil
}

func (s *StadiumService) Get(ctx context.Context, id int64) (*Stadium, error) {
	st, err := s.store.GetStadium(ctx, id)
	if err != nil {
		return nil, err
	}
	return &Stadium{
		ID:       st.ID,
		Name:     st.Name,
		Capacity: fromNullInt32(st.Capacity),
	}, nil
}

func (s *StadiumService) List(ctx context.Context) ([]*Stadium, error) {
	rows, err := s.store.ListStadiums(ctx)
	if err != nil {
		return nil, err
	}

	var stadiums []*Stadium
	for _, st := range rows {
		stadiums = append(stadiums, &Stadium{
			ID:       st.ID,
			Name:     st.Name,
			Capacity: fromNullInt32(st.Capacity),
		})
	}
	return stadiums, nil
}

func (s *StadiumService) Update(ctx context.Context, id int64, req UpdateStadiumRequest) (*Stadium, error) {
	err := s.store.UpdateStadium(ctx, store.UpdateStadiumParams{
		ID:       id,
		Name:     req.Name,
		Capacity: toNullInt32(req.Capacity),
	})
	if err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

func (s *StadiumService) Delete(ctx context.Context, id int64) error {
	return s.store.DeleteStadium(ctx, id)
}
