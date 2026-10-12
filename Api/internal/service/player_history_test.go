package service

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"reflect"
	"testing"
	"time"

	"github.com/football-api/internal/store"
	"github.com/jackc/pgx/v5/pgconn"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// Run against an isolated database with all migrations applied.
func TestPlayerStatisticsHistory(t *testing.T) {
	dsn := os.Getenv("HISTORY_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set HISTORY_TEST_DATABASE_URL to run PostgreSQL history integration tests")
	}
	ctx := context.Background()
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	insertID := func(query string, args ...any) int64 {
		t.Helper()
		var id int64
		if err := tx.QueryRowContext(ctx, query, args...).Scan(&id); err != nil {
			t.Fatal(err)
		}
		return id
	}
	exec := func(query string, args ...any) {
		t.Helper()
		if _, err := tx.ExecContext(ctx, query, args...); err != nil {
			t.Fatal(err)
		}
	}
	home := insertID("INSERT INTO Team(name) VALUES ('History home') RETURNING id")
	away := insertID("INSERT INTO Team(name) VALUES ('History away') RETURNING id")
	other := insertID("INSERT INTO Team(name) VALUES ('History other') RETURNING id")
	stadium := insertID("INSERT INTO Stadium(name, capacity) VALUES ('History stadium', 1000) RETURNING id")
	season := insertID("INSERT INTO Season(start_date, end_date) VALUES ('2090-01-01', '2090-12-31') RETURNING id")
	match := insertID("INSERT INTO Match(home_team_id, away_team_id, season_id, stadium_id, match_date, disputed) VALUES ($1,$2,$3,$4,'2090-06-01',true) RETURNING id", home, away, season, stadium)
	player := insertID("INSERT INTO Footballer(team_id, name, number) VALUES ($1,'History goalkeeper',1) RETURNING id", home)
	exec("INSERT INTO Player(footballer_id, position) VALUES ($1,'Portero')", player)
	stats := NewPlayerStatsService(q)
	req := CreatePlayerStatRequest{PlayerID: player, MatchID: match, GoalsScored: 2, Assists: 1,
		ShotsOnGoal: 3, PassesCompleted: 4, Interceptions: 5, Tackles: 6, Blocks: 7, Saves: 8, GoalsConceded: 9}
	stat, err := stats.Create(ctx, req)
	if err != nil {
		t.Fatal(err)
	}
	if stat.TeamID != home || stat.Blocks != 7 || stat.Saves != 8 || stat.GoalsConceded != 9 {
		t.Fatalf("participation and goalkeeper metrics were not saved: %+v", stat)
	}

	reports := NewReportsService(q)
	date := time.Date(2090, 6, 1, 0, 0, 0, 0, time.UTC)
	snapshot := func() []any {
		t.Helper()
		result := []any{}
		collect := func(value any, err error) {
			if err != nil {
				t.Fatal(err)
			}
			result = append(result, value)
		}
		row, err := q.GetMatch(ctx, match)
		if err != nil || row.HomeGoals != 2 || row.AwayGoals != 0 {
			t.Fatalf("wrong historical score: %+v, %v", row, err)
		}
		collect(row, err)
		collect(q.ListMatches(ctx))
		collect(q.ListMatchesBySeason(ctx, int64ToNullInt64(season)))
		collect(q.GetMatchesByHomeTeam(ctx, int64ToNullInt64(home)))
		collect(q.GetMatchesByAwayTeam(ctx, int64ToNullInt64(away)))
		collect(reports.Standings(ctx, season))
		collect(reports.TeamStatus(ctx, home, season))
		collect(reports.TeamStatus(ctx, away, season))
		collect(reports.MatchesBetweenTeams(ctx, home, away, &season))
		collect(reports.MatchesBetweenTeams(ctx, home, away, nil))
		collect(reports.MatchesByDate(ctx, date, date, nil))
		collect(reports.MatchesByDate(ctx, date, date, &stadium))
		return result
	}
	before := snapshot()
	// Transferring to the opponent used to move the goals to the opposite side.
	exec("UPDATE Footballer SET team_id = $1 WHERE id = $2", away, player)
	if !reflect.DeepEqual(before, snapshot()) {
		t.Fatal("a transfer changed historical match scores or reports")
	}
	// A correction is still possible after transferring outside both match teams.
	exec("UPDATE Footballer SET team_id = $1 WHERE id = $2", other, player)
	req.Blocks, req.Saves, req.GoalsConceded = 10, 11, 12
	if err := stats.Update(ctx, stat.ID, req); err != nil {
		t.Fatal(err)
	}
	updated, err := stats.Get(ctx, stat.ID)
	if err != nil || updated.TeamID != home || updated.Blocks != 10 || updated.Saves != 11 || updated.GoalsConceded != 12 {
		t.Fatalf("correction changed affiliation or lost metrics: %+v, %v", updated, err)
	}
	if !reflect.DeepEqual(before, snapshot()) {
		t.Fatal("editing goalkeeper metrics after a transfer changed historical reports")
	}
	exec("UPDATE PlayerStats SET team_id = $1 WHERE id = $2", away, stat.ID)
	updated, err = stats.Get(ctx, stat.ID)
	if err != nil || updated.TeamID != home {
		t.Fatal("the historical team could be overwritten")
	}
	var inUse *EntityInUseError
	if err := NewPlayerService(q).DeletePlayer(ctx, player); !errors.As(err, &inUse) {
		t.Fatalf("player deletion must return an entity-in-use error, got %v", err)
	}

	// Savepoints let each rejected SQL statement leave the test transaction usable.
	reject := func(code, query string, args ...any) {
		t.Helper()
		exec("SAVEPOINT history_rule")
		_, err := tx.ExecContext(ctx, query, args...)
		var pgErr *pgconn.PgError
		if !errors.As(err, &pgErr) || pgErr.Code != code {
			t.Fatalf("expected SQLSTATE %s, got %v", code, err)
		}
		exec("ROLLBACK TO SAVEPOINT history_rule")
		exec("RELEASE SAVEPOINT history_rule")
	}
	reject("23503", "DELETE FROM Player WHERE footballer_id = $1", player)
	reject("23503", "DELETE FROM Footballer WHERE id = $1", player)
	reject("23514", "UPDATE Match SET home_team_id = $1 WHERE id = $2", other, match)
	secondMatch := insertID("INSERT INTO Match(home_team_id, away_team_id, season_id, stadium_id, match_date, disputed) VALUES ($1,$2,$3,$4,'2090-07-01',true) RETURNING id", other, away, season, stadium)
	reject("23514", "UPDATE PlayerStats SET match_id = $1 WHERE id = $2", secondMatch, stat.ID)
	outsider := insertID("INSERT INTO Footballer(team_id, name, number) VALUES ($1,'History outsider',2) RETURNING id", other)
	exec("INSERT INTO Player(footballer_id, position) VALUES ($1,'Defensa')", outsider)
	reject("23514", "UPDATE PlayerStats SET player_id = $1 WHERE id = $2", outsider, stat.ID)
	reject("23514", "INSERT INTO PlayerStats(player_id, match_id) VALUES ($1,$2)", outsider, match)
	newReq := req
	newReq.MatchID, newReq.GoalsScored = secondMatch, 1
	newStat, err := stats.Create(ctx, newReq)
	if err != nil || newStat.TeamID != other {
		t.Fatalf("new participation must capture the new team: %+v, %v", newStat, err)
	}
	if err := NewPlayerService(q).DeletePlayer(ctx, outsider); err != nil {
		t.Fatalf("a player without statistics should be deletable: %v", err)
	}
}
