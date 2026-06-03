package service

import (
	"context"
	"database/sql"

	"github.com/football-api/internal/store"
)

type TeamService struct {
	store *store.Queries
}

func NewTeamService(s *store.Queries) *TeamService {
	return &TeamService{store: s}
}

type Team struct {
	ID                  int64     `json:"id"`
	Name                string    `json:"name"`
	Province            string    `json:"province,omitempty"`
	Mascot              string    `json:"mascot,omitempty"`
	Color               string    `json:"color,omitempty"`
	ChampionshipsPlayed int32     `json:"championships_played,omitempty"`
	ChampionshipsWon    int32     `json:"championships_won,omitempty"`
	Players             []*Player `json:"players,omitempty"`
	Coaches             []*Coach  `json:"coaches,omitempty"`
}

type CreateTeamRequest struct {
	Name                string `json:"name" validate:"required"`
	Province            string `json:"province"`
	Mascot              string `json:"mascot"`
	Color               string `json:"color"`
	ChampionshipsPlayed int32  `json:"championships_played"`
	ChampionshipsWon    int32  `json:"championships_won"`
}

type UpdateTeamRequest struct {
	Name                string `json:"name" validate:"required"`
	Province            string `json:"province"`
	Mascot              string `json:"mascot"`
	Color               string `json:"color"`
	ChampionshipsPlayed int32  `json:"championships_played"`
	ChampionshipsWon    int32  `json:"championships_won"`
}

func (s *TeamService) fetchPlayersByTeam(ctx context.Context, teamID int64) ([]*Player, error) {
	rows, err := s.store.ListPlayersByTeam(ctx, sql.NullInt64{Int64: teamID, Valid: true})
	if err != nil {
		return nil, err
	}
	players := make([]*Player, len(rows))
	for i, r := range rows {
		players[i] = &Player{
			ID:          r.ID,
			TeamID:      nullInt64ToInt64(r.TeamID),
			Name:        r.Name,
			Number:      nullInt32ToInt32(r.Number),
			YearsInTeam: nullInt32ToInt32(r.YearsInTeam),
			Position:    r.Position,
		}
	}
	return players, nil
}

func (s *TeamService) fetchCoachesByTeam(ctx context.Context, teamID int64) ([]*Coach, error) {
	rows, err := s.store.ListCoachesByTeam(ctx, sql.NullInt64{Int64: teamID, Valid: true})
	if err != nil {
		return nil, err
	}
	coaches := make([]*Coach, len(rows))
	for i, r := range rows {
		coaches[i] = &Coach{
			ID:               r.ID,
			TeamID:           nullInt64ToInt64(r.TeamID),
			Name:             r.Name,
			Number:           nullInt32ToInt32(r.Number),
			YearsInTeam:      nullInt32ToInt32(r.YearsInTeam),
			ExperienceYears:  nullInt32ToInt32(r.ExperienceYears),
			ChampionshipsWon: nullInt32ToInt32(r.ChampionshipsWon),
		}
	}
	return coaches, nil
}

func (s *TeamService) Create(ctx context.Context, req CreateTeamRequest) (*Team, error) {
	if conflict, err := teamNameConflictsWithStadiums(ctx, s.store, req.Name); err != nil {
		return nil, err
	} else if conflict {
		return nil, ErrNameConflict
	}

	id, err := s.store.CreateTeam(ctx, store.CreateTeamParams{
		Name:                req.Name,
		Province:            toNullString(req.Province),
		Mascot:              toNullString(req.Mascot),
		Color:               toNullString(req.Color),
		ChampionshipsPlayed: toNullInt32(req.ChampionshipsPlayed),
		ChampionshipsWon:    toNullInt32(req.ChampionshipsWon),
	})
	if err != nil {
		return nil, err
	}

	t, err := s.store.GetTeam(ctx, id)
	if err != nil {
		return nil, err
	}

	return &Team{
		ID:                  t.ID,
		Name:                t.Name,
		Province:            fromNullString(t.Province),
		Mascot:              fromNullString(t.Mascot),
		Color:               fromNullString(t.Color),
		ChampionshipsPlayed: fromNullInt32(t.ChampionshipsPlayed),
		ChampionshipsWon:    fromNullInt32(t.ChampionshipsWon),
		Players:             []*Player{},
		Coaches:             []*Coach{},
	}, nil
}

func (s *TeamService) Get(ctx context.Context, id int64) (*Team, error) {
	t, err := s.store.GetTeam(ctx, id)
	if err != nil {
		return nil, err
	}

	players, err := s.fetchPlayersByTeam(ctx, id)
	if err != nil {
		return nil, err
	}

	coaches, err := s.fetchCoachesByTeam(ctx, id)
	if err != nil {
		return nil, err
	}

	return &Team{
		ID:                  t.ID,
		Name:                t.Name,
		Province:            fromNullString(t.Province),
		Mascot:              fromNullString(t.Mascot),
		Color:               fromNullString(t.Color),
		ChampionshipsPlayed: fromNullInt32(t.ChampionshipsPlayed),
		ChampionshipsWon:    fromNullInt32(t.ChampionshipsWon),
		Players:             players,
		Coaches:             coaches,
	}, nil
}

func (s *TeamService) List(ctx context.Context, limit, offset int) ([]*Team, error) {
	rows, err := s.store.ListTeams(ctx)
	if err != nil {
		return nil, err
	}

	var teams []*Team
	for _, t := range rows {
		players, err := s.fetchPlayersByTeam(ctx, t.ID)
		if err != nil {
			return nil, err
		}
		coaches, err := s.fetchCoachesByTeam(ctx, t.ID)
		if err != nil {
			return nil, err
		}
		teams = append(teams, &Team{
			ID:                  t.ID,
			Name:                t.Name,
			Province:            fromNullString(t.Province),
			Mascot:              fromNullString(t.Mascot),
			Color:               fromNullString(t.Color),
			ChampionshipsPlayed: fromNullInt32(t.ChampionshipsPlayed),
			ChampionshipsWon:    fromNullInt32(t.ChampionshipsWon),
			Players:             players,
			Coaches:             coaches,
		})
	}
	return paginateSlice(teams, limit, offset), nil
}

func (s *TeamService) Update(ctx context.Context, id int64, req UpdateTeamRequest) (*Team, error) {
	if conflict, err := teamNameConflictsWithStadiums(ctx, s.store, req.Name); err != nil {
		return nil, err
	} else if conflict {
		return nil, ErrNameConflict
	}

	err := s.store.UpdateTeam(ctx, store.UpdateTeamParams{
		ID:                  id,
		Name:                req.Name,
		Province:            toNullString(req.Province),
		Mascot:              toNullString(req.Mascot),
		Color:               toNullString(req.Color),
		ChampionshipsPlayed: toNullInt32(req.ChampionshipsPlayed),
		ChampionshipsWon:    toNullInt32(req.ChampionshipsWon),
	})
	if err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

func (s *TeamService) Delete(ctx context.Context, id int64) error {
	if err := ValidateTeamCanBeDeleted(ctx, s.store, id); err != nil {
		return err
	}

	return s.store.DeleteTeam(ctx, id)
}
