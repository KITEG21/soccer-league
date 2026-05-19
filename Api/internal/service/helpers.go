package service

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/football-api/internal/store"
)

var ErrNameConflict = errors.New("name already exists in the other entity")

func toNullString(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}

func fromNullString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func toNullInt32(i int32) sql.NullInt32 {
	return sql.NullInt32{Int32: i, Valid: true}
}

func fromNullInt32(ni sql.NullInt32) int32 {
	if ni.Valid {
		return ni.Int32
	}
	return 0
}

func toNullInt64(i int64) sql.NullInt64 {
	return sql.NullInt64{Int64: i, Valid: true}
}

func fromNullInt64(ni sql.NullInt64) int64 {
	if ni.Valid {
		return ni.Int64
	}
	return 0
}

func toNullTime(s string) sql.NullTime {
	if s == "" {
		return sql.NullTime{Valid: false}
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{Time: t, Valid: true}
}

func fromNullTime(nt sql.NullTime) string {
	if nt.Valid {
		return nt.Time.Format("2006-01-02")
	}
	return ""
}

func normalizeName(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}

func teamNameConflictsWithStadiums(ctx context.Context, q *store.Queries, name string) (bool, error) {
	stadiums, err := q.ListStadiums(ctx)
	if err != nil {
		return false, err
	}
	normalized := normalizeName(name)
	for _, stadium := range stadiums {
		if normalizeName(stadium.Name) == normalized {
			return true, nil
		}
	}
	return false, nil
}

func stadiumNameConflictsWithTeams(ctx context.Context, q *store.Queries, name string) (bool, error) {
	teams, err := q.ListTeams(ctx)
	if err != nil {
		return false, err
	}
	normalized := normalizeName(name)
	for _, team := range teams {
		if normalizeName(team.Name) == normalized {
			return true, nil
		}
	}
	return false, nil
}
