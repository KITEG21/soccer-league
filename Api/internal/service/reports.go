package service

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"github.com/football-api/internal/store"
)

type ReportsService struct {
	store *store.Queries
}

func NewReportsService(s *store.Queries) *ReportsService {
	return &ReportsService{store: s}
}

type StandingRow struct {
	TeamID int64  `json:"team_id"`
	Name   string `json:"name"`
	Points int64  `json:"points"`
}

type MatchBetweenTeamsRow struct {
	ID           int64  `json:"id"`
	MatchDate    string `json:"match_date"`
	StadiumName  string `json:"stadium_name"`
	HomeTeamName string `json:"home_team_name"`
	AwayTeamName string `json:"away_team_name"`
	HomeGoals    int32  `json:"home_goals"`
	AwayGoals    int32  `json:"away_goals"`
	HomeAssists  int64  `json:"home_assists"`
	AwayAssists  int64  `json:"away_assists"`
}

type MatchByDateRow struct {
	ID           int64  `json:"id"`
	MatchDate    string `json:"match_date"`
	StadiumName  string `json:"stadium_name"`
	HomeTeamName string `json:"home_team_name"`
	AwayTeamName string `json:"away_team_name"`
	HomeGoals    int32  `json:"home_goals"`
	AwayGoals    int32  `json:"away_goals"`
	Attendance   int32  `json:"attendance"`
}

type CoachReportRow struct {
	Name             string `json:"name"`
	Number           int32  `json:"number"`
	ExperienceYears  int32  `json:"experience_years"`
	ChampionshipsWon int32  `json:"championships_won"`
	TeamName         string `json:"team_name"`
}

type StadiumAttendanceRow struct {
	ID                   int64   `json:"id"`
	Name                 string  `json:"name"`
	Capacity             int32   `json:"capacity"`
	TotalAttendance      int64   `json:"total_attendance"`
	TotalMatches         int64   `json:"total_matches"`
	AttendancePercentage float64 `json:"attendance_percentage"`
}

type TeamStatusRow struct {
	TeamID      int64  `json:"team_id"`
	Name        string `json:"name"`
	HomeWins    int64  `json:"home_wins"`
	HomeDraws   int64  `json:"home_draws"`
	HomeLosses  int64  `json:"home_losses"`
	AwayWins    int64  `json:"away_wins"`
	AwayDraws   int64  `json:"away_draws"`
	AwayLosses  int64  `json:"away_losses"`
	TotalWins   int64  `json:"total_wins"`
	TotalDraws  int64  `json:"total_draws"`
	TotalLosses int64  `json:"total_losses"`
}

type AllStarRow struct {
	Position        string `json:"position"`
	PlayerName      string `json:"player_name"`
	TeamName        string `json:"team_name"`
	MetricName      string `json:"metric_name"`
	MetricValue     int64  `json:"metric_value"`
	GoalsScored     int64  `json:"goals_scored"`
	Assists         int64  `json:"assists"`
	ShotsOnGoal     int64  `json:"shots_on_goal"`
	PassesCompleted int64  `json:"passes_completed"`
	Interceptions   int64  `json:"interceptions"`
	Tackles         int64  `json:"tackles"`
	Blocks          int64  `json:"blocks"`
	Saves           int64  `json:"saves"`
	GoalsConceded   int64  `json:"goals_conceded"`
}

func anyToInt64(v any) int64 {
	switch value := v.(type) {
	case int:
		return int64(value)
	case int32:
		return int64(value)
	case int64:
		return value
	case float64:
		return int64(value)
	case []byte:
		n, _ := strconv.ParseInt(string(value), 10, 64)
		return n
	case string:
		n, _ := strconv.ParseInt(value, 10, 64)
		return n
	default:
		return 0
	}
}

func anyToFloat64(v any) float64 {
	switch value := v.(type) {
	case float32:
		return float64(value)
	case float64:
		return value
	case int:
		return float64(value)
	case int32:
		return float64(value)
	case int64:
		return float64(value)
	case []byte:
		n, _ := strconv.ParseFloat(string(value), 64)
		return n
	case string:
		n, _ := strconv.ParseFloat(value, 64)
		return n
	default:
		return 0
	}
}

func parseReportDate(value string) (time.Time, error) {
	if value == "" {
		return time.Time{}, fmt.Errorf("date is required")
	}
	return time.Parse("2006-01-02", value)
}

func (s *ReportsService) Standings(ctx context.Context, seasonID int64) ([]*StandingRow, error) {
	rows, err := s.store.ListStandings(ctx, int64ToNullInt64(seasonID))
	if err != nil {
		return nil, err
	}
	var result []*StandingRow
	for _, row := range rows {
		result = append(result, &StandingRow{
			TeamID: row.TeamID,
			Name:   row.Name,
			Points: anyToInt64(row.Points),
		})
	}
	return result, nil
}

func (s *ReportsService) MatchesBetweenTeams(ctx context.Context, team1ID, team2ID int64, seasonID *int64) ([]*MatchBetweenTeamsRow, error) {
	var rows []store.ListMatchesBetweenTeamsRow
	var err error
	if seasonID != nil {
		rows, err = s.store.ListMatchesBetweenTeams(ctx, store.ListMatchesBetweenTeamsParams{
			HomeTeamID: int64ToNullInt64(team1ID),
			AwayTeamID: int64ToNullInt64(team2ID),
			SeasonID:   int64ToNullInt64(*seasonID),
		})
	} else {
		allRows, allErr := s.store.ListMatchesBetweenTeamsAllSeasons(ctx, store.ListMatchesBetweenTeamsAllSeasonsParams{
			HomeTeamID: int64ToNullInt64(team1ID),
			AwayTeamID: int64ToNullInt64(team2ID),
		})
		if allErr != nil {
			return nil, allErr
		}
		result := make([]*MatchBetweenTeamsRow, 0, len(allRows))
		for _, row := range allRows {
			result = append(result, &MatchBetweenTeamsRow{
				ID:           row.ID,
				MatchDate:    row.MatchDate.Format("2006-01-02"),
				StadiumName:  row.StadiumName,
				HomeTeamName: row.HomeTeamName,
				AwayTeamName: row.AwayTeamName,
				HomeGoals:    row.HomeGoals,
				AwayGoals:    row.AwayGoals,
				HomeAssists:  anyToInt64(row.HomeAssists),
				AwayAssists:  anyToInt64(row.AwayAssists),
			})
		}
		return result, nil
	}
	if err != nil {
		return nil, err
	}
	result := make([]*MatchBetweenTeamsRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, &MatchBetweenTeamsRow{
			ID:           row.ID,
			MatchDate:    row.MatchDate.Format("2006-01-02"),
			StadiumName:  row.StadiumName,
			HomeTeamName: row.HomeTeamName,
			AwayTeamName: row.AwayTeamName,
			HomeGoals:    row.HomeGoals,
			AwayGoals:    row.AwayGoals,
			HomeAssists:  anyToInt64(row.HomeAssists),
			AwayAssists:  anyToInt64(row.AwayAssists),
		})
	}
	return result, nil
}

func (s *ReportsService) MatchesByDate(ctx context.Context, date string, stadiumID *int64) ([]*MatchByDateRow, error) {
	matchDate, err := parseReportDate(date)
	if err != nil {
		return nil, err
	}
	if stadiumID != nil {
		rows, err := s.store.ListMatchesForDateAndStadium(ctx, store.ListMatchesForDateAndStadiumParams{
			MatchDate: matchDate,
			StadiumID: int64ToNullInt64(*stadiumID),
		})
		if err != nil {
			return nil, err
		}
		result := make([]*MatchByDateRow, 0, len(rows))
		for _, row := range rows {
			result = append(result, &MatchByDateRow{
				ID:           row.ID,
				MatchDate:    row.MatchDate.Format("2006-01-02"),
				StadiumName:  row.StadiumName,
				HomeTeamName: row.HomeTeamName,
				AwayTeamName: row.AwayTeamName,
				HomeGoals:    row.HomeGoals,
				AwayGoals:    row.AwayGoals,
				Attendance:   fromNullInt32(row.Attendance),
			})
		}
		return result, nil
	}
	rows, err := s.store.ListMatchesForDate(ctx, matchDate)
	if err != nil {
		return nil, err
	}
	result := make([]*MatchByDateRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, &MatchByDateRow{
			ID:           row.ID,
			MatchDate:    row.MatchDate.Format("2006-01-02"),
			StadiumName:  row.StadiumName,
			HomeTeamName: row.HomeTeamName,
			AwayTeamName: row.AwayTeamName,
			HomeGoals:    row.HomeGoals,
			AwayGoals:    row.AwayGoals,
			Attendance:   fromNullInt32(row.Attendance),
		})
	}
	return result, nil
}

func (s *ReportsService) CoachesByExperience(ctx context.Context) ([]*CoachReportRow, error) {
	rows, err := s.store.ListCoachesByExperience(ctx)
	if err != nil {
		return nil, err
	}
	var result []*CoachReportRow
	for _, row := range rows {
		result = append(result, &CoachReportRow{
			Name:             row.Name,
			Number:           nullInt32ToInt32(row.Number),
			ExperienceYears:  nullInt32ToInt32(row.ExperienceYears),
			ChampionshipsWon: nullInt32ToInt32(row.ChampionshipsWon),
			TeamName:         fromNullString(row.TeamName),
		})
	}
	return result, nil
}

func (s *ReportsService) StadiumsByAttendance(ctx context.Context, seasonID int64) ([]*StadiumAttendanceRow, error) {
	rows, err := s.store.ListStadiumsByAttendance(ctx, int64ToNullInt64(seasonID))
	if err != nil {
		return nil, err
	}
	var result []*StadiumAttendanceRow
	for _, row := range rows {
		capacity := fromNullInt32(row.Capacity)
		totalAttendance := anyToInt64(row.TotalAttendance)
		totalMatches := row.TotalMatches
		percentage := 0.0
		if capacity > 0 && totalMatches > 0 {
			percentage = (float64(totalAttendance) / (float64(totalMatches) * float64(capacity))) * 100
		}
		result = append(result, &StadiumAttendanceRow{
			ID:                   row.ID,
			Name:                 row.Name,
			Capacity:             capacity,
			TotalAttendance:      totalAttendance,
			TotalMatches:         totalMatches,
			AttendancePercentage: percentage,
		})
	}
	return result, nil
}

func (s *ReportsService) TeamStatus(ctx context.Context, teamID, seasonID int64) (*TeamStatusRow, error) {
	row, err := s.store.GetTeamStatus(ctx, store.GetTeamStatusParams{
		ID:       teamID,
		SeasonID: int64ToNullInt64(seasonID),
	})
	if err != nil {
		return nil, err
	}
	return &TeamStatusRow{
		TeamID:      row.TeamID,
		Name:        row.Name,
		HomeWins:    row.HomeWins,
		HomeDraws:   row.HomeDraws,
		HomeLosses:  row.HomeLosses,
		AwayWins:    row.AwayWins,
		AwayDraws:   row.AwayDraws,
		AwayLosses:  row.AwayLosses,
		TotalWins:   row.TotalWins,
		TotalDraws:  row.TotalDraws,
		TotalLosses: row.TotalLosses,
	}, nil
}

func (s *ReportsService) AllStarTeam(ctx context.Context, seasonID int64) ([]*AllStarRow, error) {
	var result []*AllStarRow

	goalkeeper, err := s.store.GetBestGoalkeeper(ctx, int64ToNullInt64(seasonID))
	if err != nil {
		if err != sql.ErrNoRows {
			return nil, err
		}
	} else {
		row := allStarRowFromGoalkeeper(goalkeeper)
		result = append(result, &row)
	}

	defenders, err := s.store.GetBestDefender(ctx, int64ToNullInt64(seasonID))
	if err != nil {
		return nil, err
	}
	for _, d := range defenders {
		row := allStarRowFromDefender(d)
		result = append(result, &row)
	}

	midfielders, err := s.store.GetBestMidfielder(ctx, int64ToNullInt64(seasonID))
	if err != nil {
		return nil, err
	}
	for _, m := range midfielders {
		row := allStarRowFromMidfielder(m)
		result = append(result, &row)
	}

	forwards, err := s.store.GetBestForward(ctx, int64ToNullInt64(seasonID))
	if err != nil {
		return nil, err
	}
	for _, f := range forwards {
		row := allStarRowFromForward(f)
		result = append(result, &row)
	}

	return result, nil
}

func allStarRowFromForward(row store.GetBestForwardRow) AllStarRow {
	return allStarRowFromCommon(row.Position, row.PlayerName, row.TeamName, row.MetricName, row.MetricValue, row.GoalsScored, row.Assists, row.ShotsOnGoal, row.PassesCompleted, row.Interceptions, row.Tackles, row.Blocks, row.Saves, row.GoalsConceded)
}

func allStarRowFromMidfielder(row store.GetBestMidfielderRow) AllStarRow {
	return allStarRowFromCommon(row.Position, row.PlayerName, row.TeamName, row.MetricName, row.MetricValue, row.GoalsScored, row.Assists, row.ShotsOnGoal, row.PassesCompleted, row.Interceptions, row.Tackles, row.Blocks, row.Saves, row.GoalsConceded)
}

func allStarRowFromDefender(row store.GetBestDefenderRow) AllStarRow {
	return allStarRowFromCommon(row.Position, row.PlayerName, row.TeamName, row.MetricName, row.MetricValue, row.GoalsScored, row.Assists, row.ShotsOnGoal, row.PassesCompleted, row.Interceptions, row.Tackles, row.Blocks, row.Saves, row.GoalsConceded)
}

func allStarRowFromGoalkeeper(row store.GetBestGoalkeeperRow) AllStarRow {
	return allStarRowFromCommon(row.Position, row.PlayerName, row.TeamName, row.MetricName, row.MetricValue, row.GoalsScored, row.Assists, row.ShotsOnGoal, row.PassesCompleted, row.Interceptions, row.Tackles, row.Blocks, row.Saves, row.GoalsConceded)
}

func allStarRowFromCommon(position, playerName, teamName, metricName string, metricValue, goalsScored, assists, shotsOnGoal, passesCompleted, interceptions, tackles, blocks, saves, goalsConceded any) AllStarRow {
	return AllStarRow{
		Position:        position,
		PlayerName:      playerName,
		TeamName:        teamName,
		MetricName:      metricName,
		MetricValue:     anyToInt64(metricValue),
		GoalsScored:     anyToInt64(goalsScored),
		Assists:         anyToInt64(assists),
		ShotsOnGoal:     anyToInt64(shotsOnGoal),
		PassesCompleted: anyToInt64(passesCompleted),
		Interceptions:   anyToInt64(interceptions),
		Tackles:         anyToInt64(tackles),
		Blocks:          anyToInt64(blocks),
		Saves:           anyToInt64(saves),
		GoalsConceded:   anyToInt64(goalsConceded),
	}
}
